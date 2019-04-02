#ifndef __TYPES_H__
#define __TYPES_H__

typedef unsigned char byte;
typedef unsigned int uint32;
typedef int int32;
typedef uint32 RowOffset;

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
    uint32 linebreak;
    uint32 separator;
    uint32 qualifier;
}
SpecialChars;

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

typedef enum
{
    ROW_OK = 0,
    ROW_HAS_DANGLING_QUALIFIERS = 1,
    ROW_MISMATCHED_COLUMN_COUNT = 2,
    ROW_MISMATCHED_QUALIFIERS = 4,
}
RowStatus;

#endif
