#ifndef __TYPES_H__
#define __TYPES_H__
typedef uint32 RowOffset;






typedef enum
{
    ROW_OK = 0,
    ROW_HAS_DANGLING_QUALIFIERS = 1,
    ROW_MISMATCHED_COLUMN_COUNT = 2,
    ROW_MISMATCHED_QUALIFIERS = 4,
}
RowStatus;

typedef enum 
{
    STARTING_QUALIFIER,
    ESCAPED_QUALIFIER,
    ENDING_QUALIFIER,
    DANGLING_QUALIFIER,

    COLUMN_END,
    ROW_END,

    CONTENT_CHAR
} 
CharGroup;

typedef struct
{
    uint32 linebreak;
    uint32 separator;
    uint32 qualifier;
}
SpecialChars;



typedef struct
{
    uint32 infoLength;
    uint32 dataLength;
    uint32 columnCount;
    RowStatus status;
}
RowInfo;

typedef struct
{
    uint32 type;
    uint32 offset;
    uint32 length;
}
ColumnInfo;


typedef struct 
{
    uint32 minLength;
    uint32 maxLength;
    uint32 emptyCount;
    uint32 stringCount;
    uint32 numberCount;
    uint32 floatCount;
} 
ColumnDescriptor;

typedef struct 
{
    uint32 rowCount;
    uint32 malformedRows;
    uint32 minRowLength;
    uint32 maxRowLength;
    uint32 sizeOfColumn;
    uint32 dataLength;
    uint32 rowsLength;
} 
LoadBufferStats;

typedef struct 
{
    LoadBufferStats stats;
    ColumnDescriptor *columns;
    byte *data;
    byte *rows;
} 
LoadBufferResult;

typedef struct 
{
    uint32 columnIndex;
    ParserState state;
    byte *ptr;

    int32 isNumber;
    int32 isFloat;
    int32 isNegative;
    int32 hasE;
    int32 signedE;
} 
LoadBufferLocals;




typedef struct 
{
    byte *buffer;
    uint32 length;
    SpecialChars specialChars;
    uint32 columnCount;
    LoadBufferResult *result;
} 
LoadBufferOptions;

typedef struct 
{
    byte *buffer;
    uint32 length;
    int32 start;
    uint32 linebreak;
    int32 result;
} 
FindClosestLineBreakOptions;

typedef struct 
{
    uint32 rowCount;
    uint32 malformedRows;
    uint32 minRowLength;
    uint32 maxRowLength;
    uint32 sizeOfColumn;
} 
AnalyzeBufferStats;

typedef struct 
{
    AnalyzeBufferStats stats;
    ColumnDescriptor *columns;
    RowOffset *rows;
} 
AnalyzeBufferResult;

typedef struct 
{
    byte *buffer;
    uint32 length;
    SpecialChars specialChars;
    uint32 columnCount;
    AnalyzeBufferResult *result;
} 
AnalyzeBufferOptions;

typedef struct 
{
    uint32 columnIndex;
    uint32 columnLength;
    uint32 rowOffset;
    uint32 rowLength;

    int32 isInQualifiers;
    int32 hasDanglingQualifiers;

    int32 isNumber;
    int32 isFloat;
    int32 isNegative;
    int32 hasE;
    int32 signedE;
} 
AnalyzeBufferLocals;

typedef struct
{
    uint32 columnIndex;
    uint32 columnOffset;
    uint32 rowOffset;
}
ToBinaryLocals;

typedef struct
{
    byte *buffer;
    uint32 bufferLength;

    uint32 *columnLengths;
    uint32 *columnOffsets;
    uint32 columnCount;

    uint32 rowLength;
    uint32 rowCount;

    SpecialChars specialChars;

    byte *rows;
}
LoadChunkOptions;

typedef struct
{
    byte *buffer;
    uint32 bufferLength;

    uint32 *columnLengths;
    uint32 *columnOffsets;
    uint32 *columnTypes;
    uint32 columnCount;

    uint32 rowLength;
    uint32 rowCount;

    SpecialChars specialChars;

    byte *rows;
}
ToBinaryOptions;

#endif
