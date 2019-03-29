#include <stdlib.h>
#include <ctype.h>
#include <emscripten.h>

#define MIN(a,b) (((a)<(b))?(a):(b))
#define MAX(a,b) (((a)>(b))?(a):(b))

typedef unsigned char byte;
typedef unsigned int uint32;
typedef int int32;
typedef uint32 RowOffset;

typedef struct _AnalysisStats {
    uint32 rowCount;
    uint32 malformedRows;
    uint32 minRowLength;
    uint32 maxRowLength;
    uint32 sizeOfField;
} AnalysisStats;

typedef struct _FieldDescriptor {
    uint32 minLength;
    uint32 maxLength;
    uint32 emptyCount;
    uint32 stringCount;
    uint32 numberCount;
    uint32 floatCount;
} FieldDescriptor;

typedef struct _FindClosestLineBreakOptions {
    byte *buffer;
    uint32 length;
    int32 start;
    uint32 linebreak;
    int32 result;
} FindClosestLineBreakOptions;

void EMSCRIPTEN_KEEPALIVE findClosestLineBreak(FindClosestLineBreakOptions *opts) {
//    /*
//    * options:
//    *  0:[0] - buffer ptr
//    *  4:[1] - buffer length
//    *  8:[2] - start
//    * 12:[3] - linebreak char
//    * 16:[4] - result space
//    */
//    byte *buffer = (byte*)options[0];
//    uint32 length = options[1];
//
//    int32 start = (int32)options[2];
//    byte linebreak = (byte)options[3];

    int32 forward = 0;
    int32 backward = 0;
    int32 offset = opts->start;

    while (offset < opts->length) {
        if (opts->buffer[offset] == opts->linebreak) {
            forward = (offset - opts->start) + 1;
            break;
        }
        ++offset;
    }

    offset = opts->start - 1;
    while (offset >= 0) {
        if (opts->buffer[offset] == opts->linebreak) {
            backward = (offset - opts->start) + 1;
            break;
        }
        --offset;
    }

    if (forward == 0 && backward == 0) {
        opts->result = 0;
    } else if (forward == 0) {
        opts->result = backward;
    } else if (backward == 0) {
        opts->result = forward;
    } else {
        opts->result = forward < abs(backward) ? forward : backward;
    }
}

void EMSCRIPTEN_KEEPALIVE analyzeBuffer(uint32 *options) {
    /*
    * options:
    *  0:[0] - buffer ptr
    *  4:[1] - buffer length
    *  8:[2] - linebreak char
    * 12:[3] - separator char
    * 16:[4] - qualifier char
    * 20:[5] - columnCount
    * 24:[6] - result start address
    */
    byte *buffer = (byte*)options[0];
    uint32 length = options[1];

    byte linebreak = (byte)options[2];
    byte separator = (byte)options[3];
    byte qualifier = (byte)options[4];

    uint32 columnCount = options[5];

    AnalysisStats *stats = (AnalysisStats*)(options + 6);
    FieldDescriptor *fields = (FieldDescriptor*)(stats + 1);
    RowOffset *rowOffsets = (RowOffset*)(fields + columnCount);

    uint32 rowOffset = 0;
    uint32 rowCount = 0;
    uint32 malformedRows = 0;

    byte* ptr = buffer;
    byte* end = buffer + length;

    uint32 rowLength = 0;
    uint32 fieldLength = 0;

    uint32 minRowLength = 0xffffffff;
    uint32 maxRowLength = 0;

    int32 isInField = 0;
    int32 isNumber = 1;
    int32 isFloat = 0;
    int32 isNegative = 0;
    int32 hasE = 0;
    int32 signedE = 0;
    int32 hasRogueQualifiers = 0;

    uint32 fieldIndex = 0;

    for (int i = 0; i < columnCount; ++i) {
        fields[i].minLength = 0xffffffff;
        fields[i].maxLength = 0;
        fields[i].emptyCount = 0;
        fields[i].stringCount = 0;
        fields[i].numberCount = 0;
        fields[i].floatCount = 0;
    }

    for (; ptr < end; ++ptr) {
        ++rowLength;

        if (*ptr == qualifier) {
            if (!fieldLength && !isInField) {
                /* STARTING QUALIFIER */
                isInField = 1;
            } else if (fieldLength && ptr + 1 < end && *(ptr + 1) == qualifier) {
                /* ESCAPED QUALIFIER */
                ++ptr;
                ++fieldLength;
                ++rowLength;
                isNumber = 0;
            } else if (fieldLength && isInField) {
                /* ENDING QUALIFIER */
                isInField = 0;
            } else {
                /* ROGUE QUALIFIER */
                hasRogueQualifiers = 1;
            }
        } else if (*ptr == separator && !isInField) {
            /* FIELD END */
            if (fieldIndex < columnCount) {
                if (fieldLength) {
                    fields[fieldIndex].minLength = MIN(fields[fieldIndex].minLength, fieldLength);
                    fields[fieldIndex].maxLength = MAX(fields[fieldIndex].maxLength, fieldLength);
                    if (isNumber) {
                        ++fields[fieldIndex].numberCount;
                        if (isFloat) {
                            ++fields[fieldIndex].floatCount;
                        }
                    } else {
                        ++fields[fieldIndex].stringCount;
                    }
                } else {
                    ++fields[fieldIndex].emptyCount;
                }
            }

            ++fieldIndex;
            fieldLength = 0;
            isNumber = 1;
            isFloat = 0;
            isNegative = 0;
            hasE = 0;
            signedE = 0;
        } else if (*ptr == linebreak && !isInField) {
            /* END OF ROW AND FIELD END*/
            if (fieldIndex < columnCount) {
                if (fieldLength) {
                    fields[fieldIndex].minLength = MIN(fields[fieldIndex].minLength, fieldLength);
                    fields[fieldIndex].maxLength = MAX(fields[fieldIndex].maxLength, fieldLength);
                    if (isNumber) {
                        ++fields[fieldIndex].numberCount;
                        if (isFloat) {
                            ++fields[fieldIndex].floatCount;
                        }
                    } else {
                        ++fields[fieldIndex].stringCount;
                    }
                } else {
                    ++fields[fieldIndex].emptyCount;
                }
            }
            ++fieldIndex;

            if (isInField || fieldIndex != columnCount || hasRogueQualifiers) {
                ++malformedRows;
            }

            minRowLength = MIN(minRowLength, rowLength);
            maxRowLength = MAX(maxRowLength, rowLength);
            *(rowOffsets++) = rowOffset;
            rowOffset += rowLength;

            hasRogueQualifiers = 0;
            fieldLength = 0;
            fieldIndex = 0;
            isInField = 0;
            rowLength = 0;
            isNumber = 1;
            isFloat = 0;
            isNegative = 0;
            hasE = 0;
            signedE = 0;
            ++rowCount;
        } else {
            /* IN-FIELD CHARACTER */
            if (isdigit(*ptr)) {
                isNumber = isNumber && 1;
            } else if (*ptr == '.' && !isFloat) {
                isFloat = 1;
            } else if (fieldLength && *ptr == 'e' && !hasE) {
                hasE = 1;
            } else if (!fieldLength && *ptr == '-') {
                isNegative = 1;
            } else if (fieldLength && (*ptr == '-' || *ptr == '+') && *(ptr - 1) == 'e' && !signedE) {
                signedE = 1;
            } else if (*ptr != '\r') {
                isNumber = 0;
            }
            ++fieldLength;
        }
    }

    if (rowLength) {
        if (fieldIndex < columnCount) {
            if (fieldLength) {
                fields[fieldIndex].minLength = MIN(fields[fieldIndex].minLength, fieldLength);
                fields[fieldIndex].maxLength = MAX(fields[fieldIndex].maxLength, fieldLength);
                if (isNumber) {
                    ++fields[fieldIndex].numberCount;
                    if (isFloat) {
                        ++fields[fieldIndex].floatCount;
                    }
                } else {
                    ++fields[fieldIndex].stringCount;
                }
            } else {
                ++fields[fieldIndex].emptyCount;
            }
        }
        ++fieldIndex;

        if (isInField || fieldIndex != columnCount || hasRogueQualifiers) {
            ++malformedRows;
        }

        *(rowOffsets++) = rowOffset;
        ++rowCount;
    }

    /*
    * [result]
    * AnalysisStats
    * FieldDescriptor[columnCount]
    * RowLength[rowCount]
    */
    stats->rowCount = rowCount;
    stats->malformedRows = malformedRows;
    stats->minRowLength = minRowLength;
    stats->maxRowLength = maxRowLength;
    stats->sizeOfField = sizeof(FieldDescriptor);
}
