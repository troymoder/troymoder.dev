---
name: "postcompile"
tagLine: "Generated code testing tool for Rust"
url: "https://github.com/troymoder/crates/tree/main/postcompile"
order: 3
links:
  - name: crates.io
    url: https://crates.io/crates/postcompile
  - name: docs.rs
    url: https://docs.rs/postcompile
---

postcompile, as the name suggests, is a tool for invoking the Rust compiler
after a build has completed. It allows you to run tests or assert that
generated code compiles when writing procedural macros. What's unique about
this project compared to other tools like
[trybuild](https://github.com/dtolnay/trybuild) is that it works with
[libtest](https://doc.rust-lang.org/rustc/tests/index.html) and embeds into
regular `#[test]` functions. It also has support for running the compiled
code and testing external crate dependencies.
