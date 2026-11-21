// Two comparison modes (no custom checkers):
//   exact : every line must be equal (CRLF and trailing empty lines are ignored).
//           If only whitespace differs -> PE, otherwise WA.
//   token : whitespace is ignored completely (compare the tokens) -> AC or WA.
const fs = require('fs');

const normalize = (s) => s.replace(/\r\n/g, '\n');
const tokens = (s) => s.split(/\s+/).filter(Boolean);

function sameTokens(a, b) {
  const x = tokens(a);
  const y = tokens(b);
  if (x.length !== y.length) return false;
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
  return true;
}

function compare(type, user, expected) {
  if (type === 'token') return sameTokens(user, expected) ? 'AC' : 'WA';
  // exact
  const strip = (s) => normalize(s).replace(/\n+$/, '');
  if (strip(user) === strip(expected)) return 'AC';
  return sameTokens(user, expected) ? 'PE' : 'WA';
}

// userOutFile: file written by the program, expected: string from the job
async function check(type, userOutFile, expected) {
  const user = await fs.promises.readFile(userOutFile, 'utf8');
  return compare(type, user, expected);
}

module.exports = { compare, check };
