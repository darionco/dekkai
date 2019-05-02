#ifndef __PARSER_H__
#define __PARSER_H__

#include "parser_types.h"

typedef void(*ParserFunc)(ParserLocals*);

void initializeParserStates(byte *location);
void EMSCRIPTEN_KEEPALIVE findClosestLineBreak(FindClosestLineBreakOptions *opts);
void EMSCRIPTEN_KEEPALIVE loadBuffer(LoadBufferOptions *opts);
void EMSCRIPTEN_KEEPALIVE analyzeBuffer(AnalyzeBufferOptions *options);
void EMSCRIPTEN_KEEPALIVE loadChunk(LoadChunkOptions *opts);
void EMSCRIPTEN_KEEPALIVE toBinary(ToBinaryOptions *options);

void parser_searching(void *arg);

#endif
