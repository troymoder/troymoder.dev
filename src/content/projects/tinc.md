---
name: "tinc"
tagLine: "gRPC-REST transcoding library for Rust"
url: "https://github.com/troymoder/crates/tree/main/tinc"
order: 1
links:
  - name: crates.io
    url: https://crates.io/crates/tinc
  - name: docs.rs
    url: https://docs.rs/tinc
---

I created tinc as a way to easily have both a gRPC API and REST API without
needing to duplicate the same code. tinc was inspired by
[Google's gRPC-REST transcoding](https://cloud.google.com/endpoints/docs/grpc/transcoding),
[grpc-gateway](https://github.com/grpc-ecosystem/grpc-gateway), and
[buf](https://github.com/bufbuild/buf). It has support for custom validation
logic using [CEL expressions](https://github.com/google/cel-spec), and
generates [OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.0) and
[JSON Schema](https://json-schema.org/) documents for the REST API.
