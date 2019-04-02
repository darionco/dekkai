#ifndef __UTILS_H__
#define __UTILS_H__

#include "types.h"

#define MIN(a,b) (((a)<(b))?(a):(b))
#define MAX(a,b) (((a)>(b))?(a):(b))

void clearMemory(uint32 *start, uint32 *end);

CharGroup parseCharGroup(AnalyzeBufferLocals *self, SpecialChars *opts, byte *ptr, byte *end);

void computeCharType(AnalyzeBufferLocals *self, byte *ptr);
void computeColumnDescriptor(AnalyzeBufferLocals *self, AnalyzeBufferOptions *opts, AnalyzeBufferResult *result);
RowOffset* computeAnalyzeBufferStats(AnalyzeBufferLocals *self, AnalyzeBufferOptions *opts, AnalyzeBufferResult *result, RowOffset *rows);

void readChunkRowEnd(AnalyzeBufferLocals *self, uint32 *rowStatus, uint32 *columnLength, byte *columnStart, LoadChunkOptions *opts);
byte* readChunkWriteChar(AnalyzeBufferLocals *self, byte *source, byte *target, LoadChunkOptions *opts);

#endif
