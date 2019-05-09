#pragma once

#include "types.h"

void clearMemory(byte *ptr, byte *end) 
{
    for (; ptr < end; ++ptr) 
    {
        *ptr = 0;
    }
}
