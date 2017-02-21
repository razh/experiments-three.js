_1 = 2
_2 = 2 * _1
_3 = 3 * _1
_4 = 4 * _1
_5 = 5 * _1
_z = _1

a = parameters => $$(parameters.map(
  ([x, y, xt = 0, yt = 0]) => _(
    [x * _1, y * _1, _z],
    align('nx_py'),
    t(xt * _1, _5 - (yt * _1), 0)
  )
))

A = a([
  [1, 5],
  [1, 1, 1],
  [1, 1, 1, 2],
  [1, 5, 2],
])

B = a([
  [1, 5],
  [2, 1, 1],
  [1, 1, 2, 1],
  [1, 1, 1, 2],
  [1, 1, 2, 3],
  [2, 1, 1, 4],
])

C = a([
  [1, 3, 0, 1],
  [2, 1, 1],
  [2, 1, 1, 4],
])

D = a([
  [1, 5],
  [1, 1, 1],
  [1, 1, 1, 4],
  [1, 4, 2, 1],
])

E = a([
  [1, 5],
  [2, 1, 1],
  [1, 1, 1, 2],
  [2, 1, 1, 4],
])

F = a([
  [1, 5],
  [2, 1, 1],
  [1, 1, 1, 2],
])

G = a([
  [1, 4, 0, 1],
  [2, 1, 1],
  [1, 1, 2, 3],
  [2, 1, 1, 4],
])

H = a([
  [1, 5],
  [1, 1, 1, 2],
  [1, 5, 2],
])

I = a([
  [3, 1],
  [1, 3, 1, 1],
  [3, 1, 0, 4],
])

J = a([
  [3, 1],
  [1, 3, 1, 1],
  [2, 1, 0, 4],
])

K = a([
  [1, 5],
  [1, 2, 2],
  [1, 1, 1, 2],
  [1, 2, 2, 3],
])

L = a([
  [1, 5],
  [2, 1, 1, 4],
])

M = a([
  [1, 5],
  [1, 2, 1],
  [1, 5, 2],
])

N = a([
  [1, 5],
  [1, 1, 1],
  [1, 4, 2, 1],
])

O = a([
  [1, 4, 0, 1],
  [1, 1, 1],
  [1, 1, 1, 4],
  [1, 4, 2],
])

P = a([
  [1, 5],
  [1, 1, 1],
  [1, 1, 1, 2],
  [1, 3, 2],
])

Q = a([
  [1, 2, 0, 1],
  [2, 1, 0, 3],
  [1, 1, 1],
  [2, 1, 1, 4],
  [1, 2, 2, 1],
])

R = a([
  [1, 5],
  [1, 1, 1],
  [1, 1, 1, 2],
  [1, 2, 2],
  [1, 2, 2, 3],
])

S = a([
  [2, 1, 1],
  [1, 1, 0, 1],
  [3, 1, 0, 2],
  [1, 1, 2, 3],
  [2, 1, 0, 4],
])

T = a([
  [3, 1],
  [1, 4, 1, 1],
])

U = a([
  [1, 4],
  [1, 1, 1, 4],
  [1, 5, 2],
])

V = a([
  [1, 4],
  [1, 1, 1, 4],
  [1, 4, 2],
])

W = a([
  [1, 5],
  [1, 2, 1, 3],
  [1, 5, 2],
])

X = a([
  [1, 2],
  [1, 2, 0, 3],
  [1, 1, 1, 2],
  [1, 2, 2],
  [1, 2, 2, 3],
])

Y = a([
  [1, 2],
  [2, 1, 0, 2],
  [2, 1, 0, 4],
  [1, 5, 2],
])

Z = a([
  [3, 1],
  [1, 1, 2, 1],
  [1, 1, 1, 2],
  [1, 1, 0, 3],
  [3, 1, 0, 4],
])

zero = a([
  [1, 5],
  [1, 1, 1],
  [1, 1, 1, 4],
  [1, 5, 2],
])

one = a([
  [1, 1],
  [1, 4, 1],
  [3, 1, 0, 4],
])

two = a([
  [3, 1],
  [1, 1, 2, 1],
  [3, 1, 0, 2],
  [1, 1, 0, 3],
  [3, 1, 0, 4],
])

three = a([
  [2, 1],
  [1, 1, 1, 2],
  [2, 1, 0, 4],
  [1, 5, 2],
])

four = a([
  [1, 2],
  [2, 1, 0, 2],
  [1, 5, 2],
])

five = a([
  [3, 1],
  [1, 1, 0, 1],
  [3, 1, 0, 2],
  [1, 1, 2, 3],
  [3, 1, 0, 4],
])

six = a([
  [1, 5],
  [1, 1, 1, 2],
  [1, 1, 1, 4],
  [1, 3, 2, 2],
])

seven = a([
  [2, 1],
  [1, 5, 2],
])

eight = a([
  [1, 5],
  [1, 1, 1],
  [1, 1, 1, 2],
  [1, 1, 1, 4],
  [1, 5, 2],
])

nine = a([
  [1, 3],
  [1, 1, 1],
  [1, 1, 1, 2],
  [1, 5, 2],
])

EXCLAMATION_MARK = a([
  [1, 3, 1],
  [1, 1, 1, 4],
])

QUOTATION_MARK = a([
  [1, 2],
  [1, 2, 2],
])

NUMBER_SIGN = a([
  [1, 5],
  [1, 1, 1, 1],
  [1, 1, 1, 3],
  [1, 5, 2],
])

APOSTROPHE = a([
  [1, 1, 0, 1],
  [1, 1, 1],
])

LEFT_PARENTHESIS = a([
  [1, 1, 1],
  [1, 3, 0, 1],
  [1, 1, 1, 4],
])

RIGHT_PARENTHESIS = a([
  [1, 1, 1],
  [1, 3, 2, 1],
  [1, 1, 1, 4],
])

PLUS_SIGN = a([
  [3, 1, 0, 2],
  [1, 1, 1, 1],
  [1, 1, 1, 3],
])

COMMA = a([
  [1, 1, 0, 4],
  [1, 1, 1, 3],
])

HYPHEN_MINUS = a([
  [3, 1, 0, 2],
])

FULL_STOP = a([
  [1, 1, 1, 4],
])

COLON = a([
  [1, 1, 1, 1],
  [1, 1, 1, 3],
])

SEMICOLON = a([
  [1, 1, 1, 1],
  [1, 1, 1, 3],
  [1, 1, 0, 4],
])

LESS_THAN_SIGN = a([
  [1, 1, 2],
  [1, 1, 1, 1],
  [1, 1, 0, 2],
  [1, 1, 1, 3],
  [1, 1, 2, 4],
])

EQUALS_SIGN = a([
  [3, 1, 0, 1],
  [3, 1, 0, 3],
])

GREATER_THAN_SIGN = a([
  [1, 1],
  [1, 1, 1, 1],
  [1, 1, 2, 2],
  [1, 1, 1, 3],
  [1, 1, 0, 4],
])

QUESTION_MARK = a([
  [3, 1],
  [1, 2, 2, 1],
  [1, 1, 1, 2],
  [1, 1, 1, 4],
])

LEFT_SQUARE_BRACKET = a([
  [1, 5],
  [1, 1, 1],
  [1, 1, 1, 4],
])

RIGHT_SQUARE_BRACKET = a([
  [1, 1, 1],
  [1, 1, 1, 4],
  [1, 5, 2],
])

LEFT_CURLY_BRACKET = a([
  [1, 1, 0, 2],
  [1, 5, 1],
  [1, 1, 2],
  [1, 1, 2, 4],
])

RIGHT_CURLY_BRACKET = a([
  [1, 1],
  [1, 1, 0, 4],
  [1, 5, 1],
  [1, 1, 2, 2],
])

chars = {
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  K,
  L,
  M,
  N,
  O,
  P,
  Q,
  R,
  S,
  T,
  U,
  V,
  W,
  X,
  Y,
  Z,
  0: zero,
  1: one,
  2: two,
  3: three,
  4: four,
  5: five,
  6: six,
  7: seven,
  8: eight,
  9: nine,
  '!': EXCLAMATION_MARK,
  '"': QUOTATION_MARK,
  '#': NUMBER_SIGN,
  "'": APOSTROPHE,
  '(': LEFT_PARENTHESIS,
  ')': RIGHT_PARENTHESIS,
  '+': PLUS_SIGN,
  ',': COMMA,
  '-': HYPHEN_MINUS,
  '.': FULL_STOP,
  ':': COLON,
  ';': SEMICOLON,
  '<': LESS_THAN_SIGN,
  '=': EQUALS_SIGN,
  '>': GREATER_THAN_SIGN,
  '?': QUESTION_MARK,
  '[': LEFT_SQUARE_BRACKET,
  ']': RIGHT_SQUARE_BRACKET,
  '{': LEFT_CURLY_BRACKET,
  '}': RIGHT_CURLY_BRACKET,
}

log = string =>
  string
    .split('')
    .map(key => key.toUpperCase())
    .reduce((array, key, index) => {
      if (chars[key]) {
        array.push(_(chars[key].clone(), tx(_4 * (index - string.length / 2))))
      }

      return array;
    }, [])

return log('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')
