#include <emscripten.h>
#include <stdlib.h>

#include "parser/parser.h"

extern void abort_noRowEnd();
extern void printNumber(int32, int32, int32, int32);

void EMSCRIPTEN_KEEPALIVE findRowEnd(Buffer *buffer, SpecialChars *specialChars, int32 *result, int32 start)
{
    int32 forward = 0;
    int32 backward = 0;
    int32 offset = start;

    while (offset < buffer->length)
    {
        if (buffer->data[offset] == specialChars->linebreak)
        {
            forward = (offset - start) + 1;
            break;
        }
        ++offset;
    }

    offset = start - 1;
    while (offset >= 0)
    {
        if (buffer->data[offset] == specialChars->linebreak)
        {
            backward = (offset - start) + 1;
            break;
        }
        --offset;
    }

    if (forward == 0 && backward == 0)
    {
        *result = 0;
    }
    else if (forward == 0)
    {
        *result = backward;
    }
    else if (backward == 0)
    {
        *result = forward;
    }
    else
    {
        *result = forward < abs(backward) ? forward : backward;
    }
}

void EMSCRIPTEN_KEEPALIVE parseBuffer(Buffer *buffer, SpecialChars *specialChars, ParserResult *result, uint32 expectedColumnCount)
{
    parser_parseBuffer(buffer, specialChars, result, expectedColumnCount);
}

