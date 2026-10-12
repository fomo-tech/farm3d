import assert from 'node:assert/strict';
import { formatCurrency } from '../src/game/economy/formatCurrency.js';
for (const [balance, expected] of [[1248,'1.248'],[999999,'999.999'],[1000000,'1.000.000'],[999949,'999.949'],[1000000000,'1.000.000.000'],[0,'0'],[NaN,'0']]) {
  assert.equal(formatCurrency(balance), expected);
}
assert.notEqual(formatCurrency(649), formatCurrency(650));
console.log('PASS: exact currency balances at purchase and abbreviation boundaries');
