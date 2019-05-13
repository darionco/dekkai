#include "binary.h"
#include "../base/clearMemory.h"

void _binary_processHeader(ParserResult *parsed, BinaryResult *result, uint32 columnCount);
void _binary_addIndex(BinaryResult *result, uint32 index);
void _binary_shiftTypesForward(DataType *arr, uint32 index, uint32 end);
bool _binary_isRowValid(BinaryResult *result, BinaryLocals *self);
void _binary_copyRow(BinaryResult *result, BinaryLocals *self);
void _binary_copyString(BinaryLocals *self, uint32 index);
void _binary_copyInt(BinaryLocals *self, uint32 index);
void _binary_copyFloat(BinaryLocals *self, uint32 index);
int _binary_parseInt(byte *ptr, uint32 length);
float _binary_parseFloat(byte *ptr, uint32 length);


void binary_convertFromParsed(ParserResult *parsed, BinaryResult *result, uint32 columnCount)
{
    BinaryLocals *self = (BinaryLocals*)(result + 1);
    uint32 *types = (uint32*)(self + 1);
    uint32 *lengths = (uint32*)(types + columnCount);
    uint32 *order = (uint32*)(lengths + columnCount);
    uint32 *offsets = (uint32*)(order + columnCount);
    byte *data = (byte*)(offsets + columnCount);

    clearMemory((byte*)result, (byte*)data);

    result->header.types = types;
    result->header.lengths = lengths;
    result->header.order = order;
    result->header.offsets = offsets;
    result->data = data;

    _binary_processHeader(parsed, result, columnCount);
    
    self->columnCount = columnCount;
    self->row = (ParserRowInfo*)parsed->layout;
    self->cells = (ParserCellInfo*)(self->row + 1);
    self->reader = parsed->data;
    self->writer = result->data;

    int cellIndex;
    int length;

    for (int i = 0; i < parsed->stats.rowCount; ++i)
    {
        if (_binary_isRowValid(result, self))
        {
            _binary_copyRow(result, self);
            ++result->header.rowCount;
        }
        self->row = (ParserRowInfo*)(self->cells + self->row->columnCount);
        self->cells = (ParserCellInfo*)(self->row + 1);
    }

}

void _binary_processHeader(ParserResult *parsed, BinaryResult *result, uint32 columnCount)
{
    result->header.columnCount = columnCount;
    result->header.rowCount = 0;
    result->header.rowLength = 0;

    for (int i = 0; i < columnCount; ++i)
    {
        if (parsed->columns[i].stringCount > parsed->columns[i].intCount + parsed->columns[i].floatCount)
        {
            result->header.types[i] = TYPE_STRING;
            result->header.lengths[i] = MIN(parsed->columns[i].maxLength, 255) + 1;
        }
        else if (parsed->columns[i].floatCount != 0)
        {
            result->header.types[i] = TYPE_FLOAT;
            result->header.lengths[i] = 4;
        }
        else
        {
            result->header.types[i] = TYPE_INT;
            result->header.lengths[i] = 4;
        }
        result->header.rowLength += result->header.lengths[i];
    }
    result->header.rowLength = (result->header.rowLength + 3) & ~0x03;

    for (int i = 0; i < columnCount; ++i)
    {
        _binary_addIndex(result, i);
    }

    uint32 offset = 0;
    for (int i = 0; i < columnCount; ++i)
    {
        result->header.offsets[result->header.order[i]] = offset;
        offset += result->header.lengths[result->header.order[i]];
    }
}

void _binary_addIndex(BinaryResult *result, uint32 index)
{
    for (int i = 0; i < index; ++i) {
        if (
            (result->header.types[index] == TYPE_INT && (result->header.types[result->header.order[i]] == TYPE_FLOAT || result->header.types[result->header.order[i]] == TYPE_STRING)) ||
            (result->header.types[index] == TYPE_FLOAT && result->header.types[result->header.order[i]] == TYPE_STRING)
        )
        {
            _binary_shiftTypesForward(result->header.order, i, index);
            result->header.order[i] = index;
            return;
        }
    }

    result->header.order[index] = index;
}

void _binary_shiftTypesForward(DataType *arr, uint32 index, uint32 end)
{
    for (int i = end; i > index; --i)
    {
        arr[i] = arr[i -1];
    }
}

bool _binary_isRowValid(BinaryResult *result, BinaryLocals *self)
{
    if (self->row->status != ROW_STATUS_OK && self->row->columnCount != self->columnCount)
    {
        return false;
    }

    for (int i = 0; i < self->columnCount; ++i)
    {
        // if (result->header.types[i] != TYPE_STRING && result->header.types[i] != self->cells[i].type && result->header.types[i] != TYPE_FLOAT)
        // {
        //     return false;
        // }
        if (
            result->header.types[i] != TYPE_STRING && 
            (
                self->cells[i].type == TYPE_STRING || 
                (
                    result->header.types[i] != self->cells[i].type &&
                    result->header.types[i] != TYPE_FLOAT
                )
            )
        )
        {
            return false;
        }
    }

    return true;
}

void _binary_copyRow(BinaryResult *result, BinaryLocals *self)
{
    uint32 cellIndex;
    self->writer = result->data + result->header.rowLength * result->header.rowCount;
    for (int i = 0; i < self->columnCount; ++i)
    {
        cellIndex = result->header.order[i];
        switch (result->header.types[cellIndex])
        {
            case TYPE_STRING:
                _binary_copyString(self, cellIndex);
                break;

            case TYPE_INT:
                _binary_copyInt(self, cellIndex);
                break;

            case TYPE_FLOAT:
                _binary_copyFloat(self, cellIndex);
                break;
        }
        self->writer += result->header.lengths[cellIndex];
    }
}

void _binary_copyString(BinaryLocals *self, uint32 index) 
{
    uint32 length = MIN(self->cells[index].length, 255);
    byte *writer = self->writer;
    byte *reader = self->reader + (uint32)self->cells[index].start;

    *(writer++) = length;
    for (int i = 0; i < length; ++i)
    {
        *(writer++) = *(reader++);
    }
}

void _binary_copyInt(BinaryLocals *self, uint32 index)
{
    int32 *ptr = (int32*)self->writer;
    byte *reader = self->reader + (uint32)self->cells[index].start;
    *ptr = _binary_parseInt(reader, self->cells[index].length);
}

void _binary_copyFloat(BinaryLocals *self, uint32 index)
{
    float *ptr = (float*)self->writer;
    byte *reader = self->reader + (uint32)self->cells[index].start;
    *ptr = _binary_parseFloat(reader, self->cells[index].length);
}

int _binary_parseInt(byte *ptr, uint32 length)
{
    bool isNegative = false;
    int value = 0;
    int i = 0;

    if (*ptr == '-')
    {
        isNegative = true;
        ++ptr;
        ++i;
    }
    else if (*ptr == '+')
    {
        ++ptr;
        ++i;
    }

    for (; i < length; ++i)
    {
        value = value * 10 + (*ptr - '0');
        ++ptr;
    }

    if (isNegative)
    {
        value *= -1;
    }

    return value;
}

float _binary_parseFloat(byte *ptr, uint32 length)
{
    bool isNegative = false;
    float value = 0;
    int i = 0;

    if (*ptr == '-')
    {
        isNegative = true;
        ++ptr;
        ++i;
    }
    else if (*ptr == '+')
    {
        ++ptr;
        ++i;
    }

    while (i < length && *ptr >= '0' && *ptr <= '9')
    {
        value = value * 10 + (*ptr - '0');
        ++ptr;
        ++i;
    }
    
    if (i < length && (*ptr == '.' || *ptr == ','))
    {
            ++ptr;
            ++i;

            float pos = 1;
            while(i < length && *ptr >= '0' && *ptr <= '9')
            {
                pos /= 10;
                value += (*ptr - '0') * pos;
                ++ptr;
                ++i;
            }
    }

    if (i < length && (*ptr == 'e' || *ptr == 'E'))
    {
        ++ptr;
        ++i;
        int e = _binary_parseInt(ptr, length - i);
        
        if (e != 0) {
            float base;
            if (e < 0)
            {
                base = 0.1;
                e = -e;
            }
            else
            {
                base = 10;
            }

            while (e != 1)
            {
                if ((e & 1) == 0)
                {
                    base = base * base;
                    e >>= 1;
                }
                else
                {
                    value *= base;
                    --e;
                }
            }
            value *= base;
        }
    }

    if (isNegative)
    {
        value *= -1;
    }

    return value;
}
