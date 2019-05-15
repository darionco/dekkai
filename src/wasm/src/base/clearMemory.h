#pragma once

#include "types.h"

static void clearMemory(byte *ptr, byte *end) 
{
    for (; ptr < end; ++ptr) 
    {
        *ptr = 0;
    }
}
