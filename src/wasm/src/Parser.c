#include "headers/Parser.h"
#include "headers/utils.h"

#include <stdlib.h>
#include <ctype.h>

void findClosestLineBreak(FindClosestLineBreakOptions *opts)
{
    int32 forward = 0;
    int32 backward = 0;
    int32 offset = opts->start;

    while (offset < opts->length)
    {
        if (opts->buffer[offset] == opts->linebreak)
        {
            forward = (offset - opts->start) + 1;
            break;
        }
        ++offset;
    }

    offset = opts->start - 1;
    while (offset >= 0)
    {
        if (opts->buffer[offset] == opts->linebreak)
        {
            backward = (offset - opts->start) + 1;
            break;
        }
        --offset;
    }

    if (forward == 0 && backward == 0)
    {
        opts->result = 0;
    } 
    else if (forward == 0)
    {
        opts->result = backward;
    } 
    else if (backward == 0)
    {
        opts->result = forward;
    } 
    else
    {
        opts->result = forward < abs(backward) ? forward : backward;
    }
}

void analyzeBuffer(AnalyzeBufferOptions *opts) 
{
    /* calculate result pointer offsets */
    AnalyzeBufferResult *result = (AnalyzeBufferResult*)(opts + 1);
    AnalyzeBufferStats *stats = &result->stats;
    AnalyzeBufferLocals *self = (AnalyzeBufferLocals*)(result + 1);
    ColumnDescriptor *columns = (ColumnDescriptor*)(self + 1);
    RowOffset *rows = (RowOffset*)(columns + opts->columnCount);

    /* clear the values (there might be garbage in them) */
    clearMemory((uint32*)result, (uint32*)rows);

    /* save the offsets to memory */
    result->columns = columns;
    result->rows = rows;
    opts->result = result;

    /* initialize relevant values */
    stats->minRowLength = 0xffffffff;
    stats->sizeOfColumn = sizeof(ColumnDescriptor);

    self->isNumber = 1;

    for (int i = 0; i < opts->columnCount; ++i) 
    {
        columns[i].minLength = 0xffffffff;
    }

    /* local variables */
    CharGroup type;

    /* get a ponter to the buffer and its end for iteration */
    byte* ptr = opts->buffer;
    byte* end = ptr + opts->length;

    /* iterate through the buffer */
    for (; ptr < end; ++ptr) 
    {
        /* increase the row length */
        ++self->rowLength;
        /* parse the character type */
        type = parseCharGroup(self, &opts->specialChars, ptr, end);

        switch (type) {
            case STARTING_QUALIFIER:
                self->isInQualifiers = 1;
                break;

            case ESCAPED_QUALIFIER:
                ++ptr;
                ++self->columnLength;
                ++self->rowLength;
                break;

            case ENDING_QUALIFIER:
                self->isInQualifiers = 0;
                break;

            case DANGLING_QUALIFIER:
                self->hasDanglingQualifiers = 1;
                ++self->columnLength;
                break;

            case COLUMN_END:
                /* column calculation */
                computeColumnDescriptor(self, opts, result);
                break;

            case ROW_END:
                /* column calculation */
                computeColumnDescriptor(self, opts, result);
                /* row calculation */
                rows = computeAnalyzeBufferStats(self, opts, result, rows);
                break;

            case CONTENT_CHAR:
                computeCharType(self, ptr);
                ++self->columnLength;
                break;
        }
    }

    if (self->rowLength) 
    {
        /* column calculation */
        computeColumnDescriptor(self, opts, result);
        /* row calculation */
        rows = computeAnalyzeBufferStats(self, opts, result, rows);
    }
}

void loadChunk(LoadChunkOptions *opts) {
    AnalyzeBufferLocals *self = (AnalyzeBufferLocals*)(opts + 1);
    opts->rows = (byte*)(self + 1);

    clearMemory((uint32*)self, (uint32*)opts->rows);

    /* get a ponter to the buffer and its end for iteration */
    byte* ptr = opts->buffer;
    byte* end = ptr + opts->bufferLength;

    /* pointers to result */
    uint32 *rowStatus;
    uint32 *columnLength;
    byte *columnContent;
    byte *columnStart;

    /* initialize the pointers */
    columnStart = opts->rows;
    rowStatus = (uint32*)columnStart;
    columnLength = (uint32*)(columnStart + opts->columnOffsets[0]);
    columnContent = columnStart + opts->columnOffsets[0] + 4;

    /* count the rows */
    uint32 rowCount = 0;

    /* local variables */
    CharGroup type;

    /* iterate through the buffer */
    for (; ptr < end; ++ptr) 
    {
        /* increase the row length */
        ++self->rowLength;
        /* parse the character type */
        type = parseCharGroup(self, &opts->specialChars, ptr, end);

        switch (type) {
            case STARTING_QUALIFIER:
                self->isInQualifiers = 1;
                break;

            case ESCAPED_QUALIFIER:
                ++ptr;
                columnContent = readChunkWriteChar(self, ptr, columnContent, opts);
                ++self->columnLength;
                ++self->rowLength;
                break;

            case ENDING_QUALIFIER:
                self->isInQualifiers = 0;
                break;

            case DANGLING_QUALIFIER:
                self->hasDanglingQualifiers = 1;
                columnContent = readChunkWriteChar(self, ptr, columnContent, opts);
                ++self->columnLength;
                break;

            case COLUMN_END:
                /* column calculation */
                *columnLength = self->columnLength;
                self->columnLength = 0;
                
                ++self->columnIndex;
                if (self->columnIndex < opts->columnCount) {
                    columnLength = (uint32*)(columnStart + opts->columnOffsets[self->columnIndex]);
                    columnContent = columnStart + opts->columnOffsets[self->columnIndex] + 4;
                }

                break;

            case ROW_END:
                /* column calculation */
                if (self->columnIndex < opts->columnCount) {
                    *columnLength = self->columnLength;
                    ++self->columnIndex;
                }

                /* row calculation */
                readChunkRowEnd(self, rowStatus, columnLength, columnStart, opts);

                ++rowCount;
                columnStart = opts->rows + opts->rowLength * rowCount;
                rowStatus = (uint32*)columnStart;
                columnLength = (uint32*)(columnStart + opts->columnOffsets[0]);
                columnContent = columnStart + opts->columnOffsets[0] + 4;

                break;

            case CONTENT_CHAR:
                columnContent = readChunkWriteChar(self, ptr, columnContent, opts);
                ++self->columnLength;
                break;
        }
    }

    if (self->rowLength) 
    {
        /* column calculation */
        if (self->columnIndex < opts->columnCount) {
            *columnLength = self->columnLength;
            ++self->columnIndex;
        }
        /* row calculation */
        readChunkRowEnd(self, rowStatus, columnLength, columnStart, opts);

        ++rowCount;
    }
}
