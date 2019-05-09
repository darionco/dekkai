#pragma once

#include "types.h"

void parser_parseBuffer(Buffer *buffer, SpecialChars *specialChars, ParserResult *result, uint32 expectedColumnCount);

void parser_state_rowStart(ParserLocals *self, SpecialChars *specialChars, ParserResult *result);
void parser_state_rowEnd(ParserLocals *self, SpecialChars *specialChars, ParserResult *result);
void parser_state_columnStart(ParserLocals *self, SpecialChars *specialChars, ParserResult *result);
void parser_state_columnEnd(ParserLocals *self, SpecialChars *specialChars, ParserResult *result);

void parser_state_readingInt(ParserLocals *self, SpecialChars *specialChars, ParserResult *result);
void parser_state_readingFloat(ParserLocals *self, SpecialChars *specialChars, ParserResult *result);
void parser_state_readingString(ParserLocals *self, SpecialChars *specialChars, ParserResult *result);

