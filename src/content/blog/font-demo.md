---
title: "Font & Ligature Demo"
date: 2026-03-08
description: "Testing JetBrains Mono ligatures, weights, and typography features"
tags: ["demo", "typography"]
---

## Programming Ligatures

JetBrains Mono has 139 code ligatures. Here are some common ones:

```js
// Arrow functions and comparisons
const fn = () => value;
const arrow = (x) => x * 2;
const check = a >= b && c <= d;
const notEqual = a !== b || c != d;
const equal = a === b && c == d;

// Logical operators
const and = a && b;
const or = a || b;
const nullish = a ?? b;
const optional = obj?.property;

// Comments and documentation
// Single line comment
/* Multi-line comment */
/** JSDoc comment */
/// Triple slash

// Assignments
let x = 0;
x += 1;
x -= 1;
x *= 2;
x /= 2;
x ||= fallback;
x &&= value;
x ??= default;
```

## More Ligature Examples

```rust
// Rust-style ligatures
fn main() -> Result<(), Error> {
    let range = 0..10;
    let inclusive = 0..=10;
    let reference = &value;
    let mutable = &mut value;
    match x {
        Some(v) => println!("{}", v),
        None => return Err(error),
    }
}
```

```haskell
-- Haskell ligatures
compose :: (b -> c) -> (a -> b) -> a -> c
compose f g x = f (g x)

bind :: Monad m => m a -> (a -> m b) -> m b
bind ma f = ma >>= f

apply :: Functor f => (a -> b) -> f a -> f b
apply = fmap
```

## Font Weights

<div style="font-weight: 100;">Thin (100): The quick brown fox jumps over the lazy dog</div>
<div style="font-weight: 200;">Extra Light (200): The quick brown fox jumps over the lazy dog</div>
<div style="font-weight: 300;">Light (300): The quick brown fox jumps over the lazy dog</div>
<div style="font-weight: 400;">Regular (400): The quick brown fox jumps over the lazy dog</div>
<div style="font-weight: 500;">Medium (500): The quick brown fox jumps over the lazy dog</div>
<div style="font-weight: 600;">Semi Bold (600): The quick brown fox jumps over the lazy dog</div>
<div style="font-weight: 700;">Bold (700): The quick brown fox jumps over the lazy dog</div>
<div style="font-weight: 800;">Extra Bold (800): The quick brown fox jumps over the lazy dog</div>

## Font Styles

<div style="font-style: normal;">Normal: Pack my box with five dozen liquor jugs</div>
<div style="font-style: italic;">Italic: Pack my box with five dozen liquor jugs</div>
<div style="font-weight: 700; font-style: italic;">Bold Italic: Pack my box with five dozen liquor jugs</div>

## Character Disambiguation

Monospace fonts need clear distinction between similar characters:

```
0O - Zero vs Capital O
1lI - One vs lowercase L vs Capital I
2Z - Two vs Capital Z
5S - Five vs Capital S
6G - Six vs Capital G
8B - Eight vs Capital B
```

## Special Characters & Symbols

```
Brackets: () [] {} <> «»
Quotes: '' "" `` ''
Math: + - × ÷ = ≠ ≈ ≤ ≥ ± ∞
Arrows: → ← ↑ ↓ ↔ ⇒ ⇐ ⇔
Logic: ∧ ∨ ¬ ∀ ∃ ∈ ∉ ⊂ ⊃
Currency: $ € £ ¥ ¢ ₿
```

## Numbers & Tabular Figures

```
Regular:  1234567890
Sequence: 0123456789

Price List (tabular alignment):
  $1.00
 $10.00
$100.00
  $0.99
```

## Code Ligature Comparison

With ligatures (default):

```js
const fn = () => x !== y && a <= b || c >= d;
```

The ligatures above combine characters like `=>`, `!==`, `&&`, `<=`, `||`, and `>=` into single glyphs for improved readability.

## Pangrams for Testing

```
English: The quick brown fox jumps over the lazy dog
German: Zwölf Boxkämpfer jagen Viktor quer über den großen Sylter Deich
French: Portez ce vieux whisky au juge blond qui fume
Spanish: El veloz murciélago hindú comía feliz cardillo y kiwi
```

## ASCII Art Test

<div style="text-align: center">

```text
╔═══════════════════════════════╗
║   JetBrains Mono Font Test    ║
╠═══════════════════════════════╣
║   ┌─────┬─────┬─────┬─────┐   ║
║   │  A  │  B  │  C  │  D  │   ║
║   ├─────┼─────┼─────┼─────┤   ║
║   │  1  │  2  │  3  │  4  │   ║
║   └─────┴─────┴─────┴─────┘   ║
╚═══════════════════════════════╝
```

</div>
