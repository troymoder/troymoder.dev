---
title: "Code Highlighting Demo"
date: 2026-03-07
description: "Demonstrating different code highlighting features"
tags: ["demo"]
---

## Line Highlighting

Use `// [!code highlight]` to highlight specific lines:

```js
function greet(name) {
    console.log("Hello!");
    console.log(`Welcome, ${name}!`); // [!code highlight]
    console.log("Goodbye!");
}
```

## Error levels

Use `// [!code error|warning|info]` to highlight specific lines:

```js
function levels() {
    console.log("Error!"); // [!code error]
    console.log("Warning!"); // [!code warning]
    console.log("Info!"); // [!code info]
}
```

## Diff Style

Show added and removed lines with `// [!code ++]` and `// [!code --]`:

```js
function calculate(a, b) {
    return a + b; // [!code --]
    return a * b; // [!code ++]
}
```

## Focus Mode

Use `// [!code focus]` to blur everything except the focused lines:

```js
function processData(data) {
    const validated = validate(data);
    const transformed = transform(validated); // [!code focus]
    const result = finalize(transformed); // [!code focus]
    return result;
}
```
