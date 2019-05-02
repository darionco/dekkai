#include "headers/utils.h"
#include <ctype.h>

void clearMemory(uint32 *ptr, uint32 *end) 
{
    for (; ptr < end; ++ptr) 
    {
        *ptr = 0;
    }
}

CharGroup parseCharGroup(AnalyzeBufferLocals *self, SpecialChars *opts, byte *ptr, byte *end) 
{
    if (*ptr == opts->qualifier) 
    {
        if (ptr + 1 < end)
        {
            byte next = *(ptr + 1);
            if (!self->columnLength) 
            {
                if (!self->isInQualifiers) 
                {
                    return STARTING_QUALIFIER;
                }
                else if (next == opts->qualifier)
                {
                    return ESCAPED_QUALIFIER;
                }
                else
                {
                    return ENDING_QUALIFIER;
                }
            }
            else if (next == opts->qualifier)
            {
                return ESCAPED_QUALIFIER;
            }
            else if (self->isInQualifiers)
            {
                return ENDING_QUALIFIER;
            }
        }
        else if (self->isInQualifiers) {
            return ENDING_QUALIFIER;
        }

        return DANGLING_QUALIFIER;
    }
    else if (*ptr == opts->separator && !self->isInQualifiers) 
    {
        return COLUMN_END;
    }
    else if (*ptr == opts->linebreak && !self->isInQualifiers)
    {
        return ROW_END;
    } 
    else 
    {
        return CONTENT_CHAR;
    }
}

void computeCharType(AnalyzeBufferLocals *self, byte *ptr) 
{
    if (isdigit(*ptr)) 
    {
        self->isNumber = self->isNumber && 1;
    } 
    else if (*ptr == '.' && !self->isFloat) 
    {
        self->isFloat = 1;
    } 
    else if (self->columnLength && *ptr == 'e' && !self->hasE) 
    {
        self->hasE = 1;
    } 
    else if (!self->columnLength && *ptr == '-') 
    {
        self->isNegative = 1;
    } 
    else if (self->columnLength && (*ptr == '-' || *ptr == '+') && *(ptr - 1) == 'e' && !self->signedE) 
    {
        self->signedE = 1;
    } 
    else if (*ptr != '\r') 
    {
        self->isNumber = 0;
    }
}

void computeColumnDescriptor(AnalyzeBufferLocals *self, AnalyzeBufferOptions *opts, AnalyzeBufferResult *result) 
{
    if (self->columnIndex < opts->columnCount) 
    {
        if (self->columnLength) 
        {
            result->columns[self->columnIndex].minLength = MIN(result->columns[self->columnIndex].minLength, self->columnLength);
            result->columns[self->columnIndex].maxLength = MAX(result->columns[self->columnIndex].maxLength, self->columnLength);
            if (self->isNumber) 
            {
                ++result->columns[self->columnIndex].numberCount;
                if (self->isFloat) 
                {
                    ++result->columns[self->columnIndex].floatCount;
                }
            } 
            else 
            {
                ++result->columns[self->columnIndex].stringCount;
            }
        } 
        else 
        {
            ++result->columns[self->columnIndex].emptyCount;
        }
    }

    ++self->columnIndex;
    self->columnLength = 0;
    self->isNumber = 1;
    self->isFloat = 0;
    self->isNegative = 0;
    self->hasE = 0;
    self->signedE = 0;
}

RowOffset* computeAnalyzeBufferStats(AnalyzeBufferLocals *self, AnalyzeBufferOptions *opts, AnalyzeBufferResult *result, RowOffset *rows)
{
    if (self->isInQualifiers || self->columnIndex != opts->columnCount || self->hasDanglingQualifiers)
    {
        ++result->stats.malformedRows;
    }

    result->stats.minRowLength = MIN(result->stats.minRowLength, self->rowLength);
    result->stats.maxRowLength = MAX(result->stats.maxRowLength, self->rowLength);
    *(rows) = self->rowOffset;
    self->rowOffset += self->rowLength;

    self->hasDanglingQualifiers = 0;
    self->columnIndex = 0;
    self->isInQualifiers = 0;
    self->rowLength = 0;
    
    ++result->stats.rowCount;

    return ++rows;
}

void readChunkRowEnd(AnalyzeBufferLocals *self, uint32 *rowStatus, uint32 *columnLength, byte *columnStart, LoadChunkOptions *opts) 
{
    /* write status */
    *rowStatus = ROW_OK;
    if (self->isInQualifiers)
    {
        *rowStatus |= ROW_MISMATCHED_QUALIFIERS;
    }

    if (self->columnIndex != opts->columnCount)
    {
        *rowStatus |= ROW_MISMATCHED_COLUMN_COUNT;
    }

    if (self->hasDanglingQualifiers)
    {
        *rowStatus |= ROW_HAS_DANGLING_QUALIFIERS;
    }

    /* set length of missing columns */
    while (self->columnIndex < opts->columnCount) {
        columnLength = (uint32*)(columnStart + opts->columnOffsets[self->columnIndex]);
        *columnLength = 0;
        ++self->columnIndex;
    }

    /* reset variables */
    self->columnIndex = 0;
    self->columnLength = 0;
    self->rowLength = 0;
    self->hasDanglingQualifiers = 0;
    self->isInQualifiers = 0;
}

byte* readChunkWriteChar(AnalyzeBufferLocals *self, byte *source, byte *target, LoadChunkOptions *opts) 
{
    if (self->columnIndex < opts->columnCount && self->columnLength < opts->columnLengths[self->columnIndex])
    {
        *target = *source;
        return ++target;
    }
    return target;
}
