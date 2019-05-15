#pragma once

#define true 1
#define false 0

#define MIN(a,b) (((a)<(b))?(a):(b))
#define MAX(a,b) (((a)>(b))?(a):(b))

typedef enum
{
    TYPE_STRING,
    TYPE_INT,
    TYPE_FLOAT,
}
DataType;

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
