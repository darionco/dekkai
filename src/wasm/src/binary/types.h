#pragma once

#include "../base/types.h"
#include "../parser/types.h"

typedef struct
{
    uint32 columnCount;
    uint32 rowCount;
    uint32 rowLength;
    uint32 *types;
    uint32 *lengths;
    uint32 *order;
    uint32 *offsets;
}
BinaryHeader;


typedef struct
{
    BinaryHeader header;
    byte *data;
}
BinaryResult;

typedef struct
{
    uint32 columnCount;
    ParserRowInfo *row;
    ParserCellInfo *cells;

    byte *writer;
    byte *reader;
}
BinaryLocals;

