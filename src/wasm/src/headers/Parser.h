#ifndef __DATA_PROCESSOR_H__
#define __DATA_PROCESSOR_H__

#include <emscripten.h>
#include "types.h"

void EMSCRIPTEN_KEEPALIVE findClosestLineBreak(FindClosestLineBreakOptions *opts);
void EMSCRIPTEN_KEEPALIVE analyzeBuffer(AnalyzeBufferOptions *options);
void EMSCRIPTEN_KEEPALIVE loadChunk(LoadChunkOptions *opts);
void EMSCRIPTEN_KEEPALIVE toBinary(ToBinaryOptions *options);

#endif
