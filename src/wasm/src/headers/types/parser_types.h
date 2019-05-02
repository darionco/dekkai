#ifndef __PARSER_TYPES_H__
#define __PARSER_TYPES_H__

#include "primitive_types.h"

typedef enum
{
    PARSER_SEARCHING,
    PARSER_READING,
    PARSER_READING_IN_QUALIFIERS,

    PARSER_STATE_SIZE,
}
ParserState;

typedef struct
{
    byte *ptr;
}
ParserLocals;

#endif
