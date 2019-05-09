#pragma once

#define true 1
#define false 0

typedef unsigned char byte;
typedef unsigned int uint32;
typedef int int32;
typedef uint32 bool;

typedef struct
{
    byte *data;
    uint32 length;
}
Buffer;
