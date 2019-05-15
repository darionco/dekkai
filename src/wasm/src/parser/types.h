#pragma once

#include "../base/types.h"

typedef enum
{
    ROW_STATUS_OK = 0,
    ROW_STATUS_DANGLING_QUALIFIER = 1,
    ROW_STATUS_COLUMN_MISMATCH = 2,
    ROW_STATUS_CELL_PARSING_FAILED = 4,
}
RowStatus;

typedef enum
{
    PARSER_STATE_ROW_START,
    PARSER_STATE_ROW_END,
    PARSER_STATE_COLUMN_START,
    PARSER_STATE_COLUMN_END,

    PARSER_STATE_READING_INT,
    PARSER_STATE_READING_FLOAT,
    PARSER_STATE_READING_STRING,

    PARSER_STATE_SIZE,
}
ParserState;

typedef struct
{
    uint32 linebreak;
    uint32 separator;
    uint32 qualifier;
}
SpecialChars;

typedef struct
{
    uint32 minLength;
    uint32 maxLength;
    
    uint32 intCount;
    uint32 floatCount;
    uint32 stringCount;
    uint32 emptyCount;
}
ParserColumnInfo;

typedef struct
{
    uint32 columnCount;
    uint32 length;
    uint32 status;
}
ParserRowInfo;

typedef struct
{
    byte *start;
    uint32 length;
    DataType type;
}
ParserCellInfo;

typedef struct
{
    uint32 rowCount;
    uint32 malformedRows;
    uint32 dataLength;
    uint32 layoutLength;
}
ParserStats;

typedef struct
{
    ParserStats stats;
    ParserColumnInfo *columns;
    byte *data;
    byte *layout;
}
ParserResult;

typedef struct
{
    ParserState state;

    uint32 expectedColumnCount;

    bool inQualifiers;
    bool parsing;

    ParserRowInfo *row;
    ParserCellInfo *cell;

    byte *reader;
    byte *end;

    byte *writer;
}
ParserLocals;
