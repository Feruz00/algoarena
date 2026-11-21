const test = require('node:test');
const assert = require('node:assert');
const { compare } = require('../src/checkers');
const { normalizeJob } = require('../src/judge');

test('exact: identical', () => assert.strictEqual(compare('exact', '3\n', '3\n'), 'AC'));
test('exact: trailing newlines ignored', () => assert.strictEqual(compare('exact', '3', '3\n\n'), 'AC'));
test('exact: CRLF ignored', () => assert.strictEqual(compare('exact', '1\r\n2\r\n', '1\n2\n'), 'AC'));
test('exact: multi-line equal', () => assert.strictEqual(compare('exact', 'a b\nc\n', 'a b\nc\n'), 'AC'));
test('exact: spaces differ -> PE', () => assert.strictEqual(compare('exact', '1  2\n', '1 2\n'), 'PE'));
test('exact: trailing space on a line -> PE', () => assert.strictEqual(compare('exact', '1 \n2\n', '1\n2\n'), 'PE'));
test('exact: lines joined -> PE', () => assert.strictEqual(compare('exact', '1 2\n', '1\n2\n'), 'PE'));
test('exact: different -> WA', () => assert.strictEqual(compare('exact', '1 3\n', '1 2\n'), 'WA'));
test('token: whitespace ignored', () => assert.strictEqual(compare('token', ' 1\n\n2   3 ', '1 2 3'), 'AC'));
test('token: different -> WA', () => assert.strictEqual(compare('token', '1 2', '1 2 3'), 'WA'));

test('job: accepts "tokens" and aliases', () => {
  const j = normalizeJob({ submissionId: 1, code: 'x', lang: 'C++17', type: 'tokens',
    time: 2000, memory: 128, testgroup: { id: 7, testcases: [{ input: '1', expectedOutput: '1' }] } });
  assert.deepStrictEqual(j.errors, []);
  assert.strictEqual(j.type, 'token');
  assert.deepStrictEqual(j.limits, { timeMs: 2000, memMb: 128 });
  assert.strictEqual(j.testgroupId, 7);
});
test('job: testcases as object', () => {
  const j = normalizeJob({ submissionId: 1, code: 'x', lang: 'python', type: 'exact',
    testgroup: { id: 1, testcases: { a: { input: '1', expectedOutput: '1' } } } });
  assert.strictEqual(j.testcases.length, 1);
});
test('job: errors reported', () => {
  const j = normalizeJob({ code: '', lang: 'cobol', type: 'weird', testgroup: {} });
  assert.ok(j.errors.length >= 4);
});
