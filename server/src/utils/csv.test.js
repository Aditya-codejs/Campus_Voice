import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeCsvCell } from './csv.js';

test('CSV cells preserve commas, quotes, and line breaks safely', () => {
  assert.equal(escapeCsvCell('room, "A"\nsecond line'), '"room, ""A""\nsecond line"');
});

test('CSV cells neutralize spreadsheet formulas', () => {
  for (const formula of ['=1+1', '+SUM(A1:A2)', '-1+2', '@SUM(A1)']) {
    assert.equal(escapeCsvCell(formula), `"'${formula}"`);
  }
});

test('CSV cells serialize empty and numeric values', () => {
  assert.equal(escapeCsvCell(null), '""');
  assert.equal(escapeCsvCell(42), '"42"');
});
