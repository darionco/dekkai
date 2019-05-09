#include <ctype.h>

#include "parser.h"
#include "../base/clearMemory.h"

#define MIN(a,b) (((a)<(b))?(a):(b))
#define MAX(a,b) (((a)>(b))?(a):(b))

void _parser_writeCharacter(ParserLocals *self);
bool _parser_isColumnEnd(ParserLocals *self, SpecialChars *specialChars);
bool _parser_handleFloatE(ParserLocals *self);

void parser_parseBuffer(Buffer *buffer, SpecialChars *specialChars, ParserResult *result, uint32 expectedColumnCount)
{   
    ParserLocals *self = (ParserLocals*)(result + 1);
    ParserColumnInfo *columnInfo = (ParserColumnInfo*)(self + 1);

    clearMemory((byte*)result, (byte*)(columnInfo + expectedColumnCount));

    result->stats.dataLength = 0;
    result->stats.layoutLength = 0;
    result->columns = columnInfo;
    result->data = (byte*)(result->columns + expectedColumnCount);
    result->layout = result->data + buffer->length;

    for (int i = 0; i < expectedColumnCount; ++i)
    {
        result->columns[i].minLength = 0xffffffff;
    }

    self->state = PARSER_STATE_ROW_START;
    self->expectedColumnCount = expectedColumnCount;
    self->parsing = true;

    self->row = (ParserRowInfo*)result->layout;
    self->cell = (ParserCellInfo*)(self->row + 1);

    self->reader = buffer->data;
    self->end = buffer->data + buffer->length;

    self->writer = result->data;

    while (self->parsing)
    {
        switch (self->state)
        {
            case PARSER_STATE_COLUMN_START:
                parser_state_columnStart(self, specialChars, result);
                break;

            case PARSER_STATE_COLUMN_END:
                parser_state_columnEnd(self, specialChars, result);
                break;

            case PARSER_STATE_ROW_START:
                parser_state_rowStart(self, specialChars, result);
                break;

            case PARSER_STATE_ROW_END:
                parser_state_rowEnd(self, specialChars, result);
                break;

            case PARSER_STATE_READING_INT:
                parser_state_readingInt(self, specialChars, result);
                break;

            case PARSER_STATE_READING_FLOAT:
                parser_state_readingFloat(self, specialChars, result);
                break;

            case PARSER_STATE_READING_STRING:
                parser_state_readingString(self, specialChars, result);
                break;

            default:
                break;
        }
    } 

    result->stats.dataLength = self->writer - result->data;
    result->stats.layoutLength = (byte*)self->cell - result->layout;
}

void parser_state_rowStart(ParserLocals *self, SpecialChars *specialChars, ParserResult *result)
{
    // ignore empty rows
    while (self->reader < self->end && *self->reader == specialChars->linebreak)
    {
        ++self->reader;
    }

    if (self->reader >= self->end)
    {
        self->parsing = false;
    }
    else
    {
        ++result->stats.rowCount;
        self->row->columnCount = 0;
        self->row->length = 0;
        self->row->status = 0;

        self->state = PARSER_STATE_COLUMN_START;
    }
}

void parser_state_rowEnd(ParserLocals *self, SpecialChars *specialChars, ParserResult *result)
{
    if (self->reader >= self->end)
    {
        self->parsing = false;
    }
    else
    {
        ++self->reader;
    }

    if (self->row->columnCount != self->expectedColumnCount)
    {
        self->row->status |= ROW_STATUS_COLUMN_MISMATCH;
    }

    if (self->row->status != ROW_STATUS_OK)
    {
        ++result->stats.malformedRows;
    }

    self->row = (ParserRowInfo*)self->cell;
    self->cell = (ParserCellInfo*)(self->row + 1);

    self->state = PARSER_STATE_ROW_START;
}

void parser_state_columnStart(ParserLocals *self, SpecialChars *specialChars, ParserResult *result)
{
    self->cell->length = 0;
    self->cell->start = (byte*)(self->writer - result->data);
    self->cell->type = TYPE_STRING;

    if(*self->reader == specialChars->qualifier)
    {
        self->inQualifiers = true;
        ++self->reader;
    }
    else
    {
        self->inQualifiers = false;
    }

    if (isdigit(*self->reader) || *self->reader == '-' || *self->reader == '+')
    {
        self->state = PARSER_STATE_READING_INT;
    }
    else
    {
        self->state = PARSER_STATE_READING_STRING;
    }
}

void parser_state_columnEnd(ParserLocals *self, SpecialChars *specialChars, ParserResult *result)
{
    if (self->inQualifiers)
    {
        if (*self->reader == specialChars->qualifier)
        {
            self->inQualifiers = false;
            ++self->reader;
        }
        else
        {
            self->row->status |= ROW_STATUS_DANGLING_QUALIFIER;
        }
    }

    if (*self->reader == '\r')
    {
        ++self->reader;
    }

    if (self->reader < self->end && *self->reader != specialChars->separator && *self->reader != specialChars->linebreak)
    {
        self->row->status |= ROW_STATUS_CELL_PARSING_FAILED;
        while (self->reader < self->end && *self->reader != specialChars->separator && *self->reader != specialChars->linebreak)
        {
            ++self->reader;
        }
    }

    if (self->reader >= self->end || *self->reader == specialChars->linebreak)
    {
        self->state = PARSER_STATE_ROW_END;
    }
    else if (*self->reader == specialChars->separator)
    {
        self->state = PARSER_STATE_COLUMN_START;
        ++self->reader;
    }

    ParserColumnInfo *columnInfo = &result->columns[self->row->columnCount];
    columnInfo->maxLength = MAX(columnInfo->maxLength, self->cell->length);
    columnInfo->minLength = MIN(columnInfo->minLength, self->cell->length);

    if (!self->cell->length)
    {
        ++columnInfo->emptyCount;
    }
    else if (self->cell->type == TYPE_INT)
    {
        ++columnInfo->intCount;
    }
    else if (self->cell->type == TYPE_FLOAT)
    {
        ++columnInfo->floatCount;
    }
    else
    {
        ++columnInfo->stringCount;
    }

    ++self->cell;
    ++self->row->columnCount;
}

void parser_state_readingInt(ParserLocals *self, SpecialChars *specialChars, ParserResult *result)
{
    self->cell->type = TYPE_INT;

    if (*self->reader == '+' || *self->reader == '-')
    {
        _parser_writeCharacter(self);
    }

    while(self->reader < self->end && isdigit(*self->reader))
    {
        _parser_writeCharacter(self);
    }

    if (_parser_isColumnEnd(self, specialChars))
    {
        self->state = PARSER_STATE_COLUMN_END;
    }
    else if (*self->reader == '.' || *self->reader == 'e' || *self->reader == 'E')
    {
        self->state = PARSER_STATE_READING_FLOAT;
    }
    else 
    {
        self->state = PARSER_STATE_READING_STRING;
    }
}

void parser_state_readingFloat(ParserLocals *self, SpecialChars *specialChars, ParserResult *result)
{
    self->cell->type = TYPE_FLOAT;

    bool hasE;
    if (_parser_handleFloatE(self))
    {
        hasE = true;
    }
    else
    {
        _parser_writeCharacter(self);
    }

    bool parsing = true;
    while (parsing)
    {
        while(self->reader < self->end && isdigit(*self->reader))
        {
            _parser_writeCharacter(self);
        }

        if (!hasE && _parser_handleFloatE(self))
        {
            hasE = true;
        }
        else
        {
            parsing = false;
        }
    }

    if (_parser_isColumnEnd(self, specialChars))
    {
        self->state = PARSER_STATE_COLUMN_END;
    }
    else 
    {
        self->state = PARSER_STATE_READING_STRING;
    }
}

void parser_state_readingString(ParserLocals *self, SpecialChars *specialChars, ParserResult *result)
{
    self->cell->type = TYPE_STRING;

    while (!_parser_isColumnEnd(self, specialChars))
    {
        if (self->inQualifiers && *self->reader == specialChars->qualifier)
        {
            ++self->reader;
        }
        _parser_writeCharacter(self);
    }
    self->state = PARSER_STATE_COLUMN_END;
}

void _parser_writeCharacter(ParserLocals *self)
{
    *self->writer = *self->reader;
    ++self->reader;
    ++self->writer;
    ++self->row->length;
    ++self->cell->length;
}

bool _parser_isColumnEnd(ParserLocals *self, SpecialChars *specialChars)
{
    return self->reader >= self->end ||
    (
        self->inQualifiers && 
        *self->reader == specialChars->qualifier &&
        self->reader < self->end - 1 &&
        *(self->reader + 1) != specialChars->qualifier
    ) ||
    (
        !self->inQualifiers &&
        (
            *self->reader == specialChars->separator ||
            *self->reader == specialChars->linebreak ||
            *self->reader == '\r'
        )
    );
}

bool _parser_handleFloatE(ParserLocals *self)
{
    if ((*self->reader == 'e' || *self->reader == 'E'))
    {
        _parser_writeCharacter(self);
        if (*self->reader == '+' || *self->reader == '-')
        {
            _parser_writeCharacter(self);
        }
        return true;
    }
    return false;
}
