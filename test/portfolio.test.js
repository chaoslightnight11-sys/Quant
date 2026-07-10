import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateStats, parseCsv, parseNumber } from '../src/portfolio.js';

test('parses Turkish and international currency formats', () => {
  assert.equal(parseNumber('₺12.345,67'), 12345.67);
  assert.equal(parseNumber('12,345.67'), 12345.67);
});

test('parses quoted CSV values and Turkish headers', () => {
  const rows = parseCsv('sembol;ad;değer;maliyet;sektör\nTHYAO;"Türk Hava, Yolları";48.500,50;40.200;Ulaşım');
  assert.equal(rows[0].name, 'Türk Hava, Yolları');
  assert.equal(rows[0].value, 48500.5);
});

test('rejects negative and zero-total portfolios', () => {
  assert.throws(() => parseCsv('sembol;değer;maliyet\nABC;-1;2'), /2\. satır/);
  assert.throws(() => parseCsv('sembol;değer;maliyet\nABC;0;0'), /sıfırdan büyük/);
});

test('calculates bounded statistics without division errors', () => {
  const stats = calculateStats([{ symbol: 'A', value: 100, cost: 0, sector: 'X' }]);
  assert.equal(stats.gainPct, 0);
  assert.ok(stats.score >= 20 && stats.score <= 100);
});
