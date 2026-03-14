---
title: Announcing Tinc
date: 2026-03-12
description: A gRPC to REST transcoding library for Rust
tags: ["crate", "grpc", "api", "rust"]
---

Writing high quality documentation is hard, yet its often a deciding
factor when choosing one library or service over another.

When it comes to writing REST APIs the type of documentation people
care about are: "what endpoints are available and how to use them"

## OpenAPI

The industry standard to describe a REST API is [OpenAPI](https://www.openapis.org/).

OpenAPI is a detailed machine readable specification for declaring endpoints
and how they behave.

Here is a simple service in rust using the [`axum`](https://docs.rs/axum) crate.

```rs
::: anchor
rust-first-example
::: links
PingRequest@12: #rust-first-example:2/PingRequest/
PingResponse@13: #rust-first-example:7/PingResponse/
PingResponse@19: #rust-first-example:7/PingResponse/
message@14: #rust-first-example:3/message/
message@20: #rust-first-example:3/message/
req@14: #rust-first-example:12/req/
req@20: #rust-first-example:12/req/
:::
#[derive(Deserialize)]
struct PingRequest {
    message: String,
}

#[derive(Serialize)]
struct PingResponse {
    response: String,
}

// POST /ping
async fn ping(
  Json(req): Json<PingRequest>,
) -> Result<Json<PingResponse>, StatusCode> {
    if !req.message.starts_with("hello:") {
        return Err(StatusCode::BAD_REQUEST);
    }

    Ok(Json(PingResponse {
        response: format!("Pong: {}", req.message),
    }))
}
```

We have a single endpoint `/ping` where you can send a POST request with a JSON
body consisting of the single field `message`, which must start with the prefix
`hello:`.

```json
::: logs
ok@1: Valid - has `message` field starting with `hello:`
error@2[3:15]: Missing required field `message`
error@3[14:19]: Message doesn't start with `hello:`
error@4[1:3]: Empty object - missing `message` field
:::
{ "message": "hello:troy" }
{ "not-message": 123 }
{ "message": "troy" }
{ }
```

The following would be the corresponding OpenAPI spec
for the given endpoint.

```json
::: anchor
openapi-code-example
::: collapse
11
21
41
53
::: hover
info@3: Metadata about the API - title, version, description, contact info
paths@7: Defines all API endpoints - maps URL paths to their operations
post@9: HTTP method for this endpoint - POST, GET, PUT, DELETE, etc.
requestBody@11: Describes the expected request payload
$ref@16: JSON Reference - points to a reusable schema definition
responses@21: Maps HTTP status codes to their response descriptions
components@39: Reusable definitions for schemas, parameters, and responses
schemas@40: Object type definitions that can be referenced via `$ref`
pattern@49: Regex pattern the string value must match
::: links
#/components/schemas/PingRequest: #openapi-code-example:41/"PingRequest"/
#/components/schemas/PingResponse: #openapi-code-example:53/"PingResponse"/
:::
{
    "openapi": "3.0.3",
    "info": {
        "title": "Ping API",
        "version": "1.0.0"
    },
    "paths": {
        "/ping": {
            "post": {
                "summary": "Post a ping message",
                "requestBody": {
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/PingRequest"
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Successful response",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/PingResponse"
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Message must start with hello"
                    }
                }
            }
        }
    },
    "components": {
        "schemas": {
            "PingRequest": {
                "type": "object",
                "required": [
                    "message"
                ],
                "properties": {
                    "message": {
                        "type": "string",
                        "pattern": "^hello:"
                    }
                }
            },
            "PingResponse": {
                "type": "object",
                "res alsquired": [
                    "response"
                ],
                "properties": {
                    "response": {
                        "type": "string"
                    }
                }
            }
        }
    }
}
```

It may seem a bit overwhelming at first, but there are only a few things that are important.

1. [`paths`](#openapi-code-example:7/"paths"/) where you define all the endpoints you have.
2. [`components`](#openapi-code-example:39/"components"/) where you define all the payload structures.
3. [`pattern`](#openapi-code-example:49/"pattern"/) we add a requirement to the [`message`](#openapi-code-example:47-50) property

## Code-first approach

People don't usually write OpenAPI spec's directly as they are verbose and
annoying to maintain.

One approach is to write code and have a framework generate the OpenAPI spec for
you. In rust a popular library for this is [`utoipa`](https://docs.rs/utoipa/latest/utoipa/).

With `utoipa` you can write something like the following:

```rs
::: anchor
rust-example-utoipa
::: links
ping@3: #rust-example-utoipa:30/fn ping/
PingRequest@4: #rust-example-utoipa:10/PingRequest/
PingResponse@4: #rust-example-utoipa:16/PingResponse/
PingRequest@24: #rust-example-utoipa:10/PingRequest/
PingResponse@26: #rust-example-utoipa:16/PingResponse/
PingRequest@31: #rust-example-utoipa:10/PingRequest/
PingResponse@32: #rust-example-utoipa:16/PingResponse/
message@33: #rust-example-utoipa:12/message/
req@33: #rust-example-utoipa:31/req/
PingResponse@37: #rust-example-utoipa:16/PingResponse/
message@38: #rust-example-utoipa:12/message/
req@38: #rust-example-utoipa:31/req/
:::
#[derive(OpenApi)]
#[openapi(
    paths(ping),
    components(schemas(PingRequest, PingResponse)),
    info(title = "Ping API", version = "1.0.0")
)]
struct ApiDoc;

#[derive(Deserialize, ToSchema)]
struct PingRequest {
    #[schema(pattern = r"^hello:")]
    message: String,
}

#[derive(Serialize, ToSchema)]
struct PingResponse {
    response: String,
}

#[utoipa::path(
    post,
    path = "/ping",
    summary = "Post a ping message",
    request_body = PingRequest,
    responses(
        (status = 200, description = "Successful response", body = PingResponse),
        (status = 400, description = "Message must start with `hello:`")
    )
)]
async fn ping(
  Json(req): Json<PingRequest>,
) -> Result<Json<PingResponse>, StatusCode> {
    if !req.message.starts_with("hello:") {
        return Err(StatusCode::BAD_REQUEST);
    }

    Ok(Json(PingResponse {
        response: format!("Pong: {}", req.message),
    }))
}
```

Its called a code first approach as the **code** becomes the source of truth for
the API documentation.

You can access the generated spec using the following code.

```rs
::: links
ApiDoc: #rust-example-utoipa:7/ApiDoc/
:::
let spec = ApiDoc::openapi();
let spec_json = serde_json::to_string(&spec).unwrap();
```

Validation here is disconnected from the schema. Even though we
declare that `#[schema(pattern = r"^hello:")]` we never actually enforce this
in our implementation. [`validator`](https://docs.rs/validator)
allows you to annotate the structs to enforce the checks.

```rs
::: anchor
rust-validator-example
::: links
starts_with_hello@13: #rust-validator-example:1/starts_with_hello/
PingRequest@22: #rust-validator-example:12/PingRequest/
PingResponse@24: #rust-validator-example:19/PingResponse/
PingRequest@27: #rust-validator-example:12/PingRequest/
PingResponse@28: #rust-validator-example:19/PingResponse/
PingRequest@34: #rust-validator-example:12/PingRequest/
PingResponse@35: #rust-validator-example:19/PingResponse/
message@39: #rust-validator-example:15/message/
req@36: #rust-validator-example:34/req/
req@39: #rust-validator-example:34/req/
PingResponse@38: #rust-validator-example:19/PingResponse/
:::
fn starts_with_hello(
    message: &str,
) -> Result<(), validator::ValidationError> {
    if message.starts_with("hello:") {
        Ok(())
    } else {
        Err(validator::ValidationError::new("must start with hello:"))
    }
}

#[derive(Deserialize, Validate, ToSchema)]
struct PingRequest {
    #[validate(custom(function = "starts_with_hello"))]
    #[schema(pattern = r"^hello:")]
    message: String,
}

#[derive(Serialize, ToSchema)]
struct PingResponse {
    response: String,
}

#[utoipa::path(
    post,
    path = "/ping",
    summary = "Post a ping message",
    request_body = PingRequest,
    responses(
        (status = 200, description = "Successful response", body = PingResponse),
        (status = 400, description = "Message must start with `hello:`")
    )
)]
async fn ping(
  Json(req): Json<PingRequest>,
) -> Result<Json<PingResponse>, StatusCode> {
    req.validate().map(|_| StatusCode::BAD_REQUEST)?;

    Ok(Json(PingResponse {
        response: format!("Pong: {}", req.message),
    }))
}
```

## Schema-first approach

Another way to go about having an API is first declaring it using a schema and then
generating the a mock for you to implement.

The most popular schema is [Protobuf](https://protobuf.dev/) which is a language
agnostic schema for defining structures and [gRPC](https://grpc.io/) which adds
to that allowing you to define services and methods aswell.

Here is an example of our simple ping-pong service using Protobuf & gRPC.

```protobuf
::: anchor
proto-example
::: links
PingRequest@14: #proto-example:5/PingRequest/
PingResponse@14: #proto-example:9/PingResponse/
:::
syntax = "proto3";

package ping;

message PingRequest {
    string message = 1;
}

message PingResponse {
    string response = 1;
}

service PingService {
    rpc Ping(PingRequest) returns PingResponse {};
}
```

Then in rust using [`tonic`](https://docs.rs/tonic) you can implement it like so

```rs
::: anchor
rust-tonic-example
::: links
ping@4: #proto-example:3/ping/
PingService@11: #proto-example:13/PingService/
MyPingService@11: #rust-tonic-example:8/MyPingService/
PingRequest@14: #proto-example:5/PingRequest/
PingResponse@15: #proto-example:9/PingResponse/
message@18: #proto-example:6/message/
req@18: #rust-tonic-example:16/req/
PingResponse@24: #proto-example:9/PingResponse/
message@25: #proto-example:6/message/
req@25: #rust-tonic-example:16/req/
:::
pub mod pb {
    // definitions are automatically generated at
    // compile time
    tonic::include_proto!("ping");
}

#[derive(Debug, Default)]
pub struct MyPingService {}

#[tonic::async_trait]
impl PingService for MyPingService {
    async fn ping(
        &self,
        request: Request<PingRequest>,
    ) -> Result<Response<PingResponse>, Status> {
        let req = request.into_inner();
 
        if !req.message.starts_with("hello:") {
            return Err(Status::invalid_argument(
                "message must start with 'hello:'",
            ));
        }
        
        Ok(Response::new(PingResponse {
            response: format!("Pong: {}", req.message),
        }))
    }
}
```

## Tinc

This is where [tinc](https://docs.rs/tinc) comes in. The above example is not REST,
its a gRPC API. To get a REST API and also an OpenAPI schema we need to "tinc-ify"
our example.

```diff lang="protobuf"
  syntax = "proto3";

+ import "tinc/annotations.proto";

  package ping;

  message PingRequest {
-     string message = 1;
+     string message = 1 [(tinc.field).constraint.string = {
+         match: "^hello:"
+     }];
  }

  message PingResponse {
      string response = 1;
  }

  service PingService {
-     rpc Ping(PingRequest) returns PingResponse {};
+     rpc Ping(PingRequest) returns PingResponse {
+         option (tinc.method).endpoint = {post: "/ping"};
+     };
  }
```

The code for the rust side is almost the same, except we just change the include
macro to be from `tinc` instead of `tonic`.

```diff lang="rs"
  pub mod pb {
      // definitions are automatically generated at
      // compile time
-     tonic::include_proto!("ping");
+     tinc::include_proto!("ping");
  }

  #[derive(Debug, Default)]
  pub struct MyPingService {}

  #[tonic::async_trait]
  impl PingService for MyPingService {
      async fn ping(
          &self,
          request: Request<PingRequest>,
      ) -> Result<Response<PingResponse>, Status> {
          let req = request.into_inner();

          if !req.message.starts_with("hello:") {
              return Err(Status::invalid_argument(
                  "message must start with 'hello:'",
              ));
          }

          Ok(Response::new(PingResponse {
              response: format!("Pong: {}", req.message),
          }))
      }
  }
```
