---
title: "Syntax Highlighting Test"
date: 2026-03-07
description: "Testing syntax highlighting"
tags: ["test"]
---

## Rust

```rust
fn main() {
    let name = "Archie";
    println!("Hello, {}!", name);
}
```

## JavaScript

```javascript
const greeting = (name) => `Hello, ${name}!`;

async function fetchData(url) {
    const response = await fetch(url);
    return response.json();
}
```

## Python

```python
def fibonacci(n: int) -> list[int]:
    if n <= 0:
        return []
    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence[:n]
```
