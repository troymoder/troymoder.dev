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
::: hover
Deserialize: From `serde` - automatically implements JSON deserialization
Serialize: From `serde` - automatically implements JSON serialization
Json@12: Axum extractor that parses the request body as JSON
StatusCode: HTTP status code from `axum::http`
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
ok@2: Valid - has `message` field starting with `hello:`
error@5: Missing required field `message`
error@6: Message doesn't start with `hello:`
error@7: Empty object - missing `message` field
:::
// A valid message
{ "message": "hello:troy" }

// Invalid messages
{ "not-message": 123 }
{ "message": "troy" }
{ }
```

The following would be the corresponding OpenAPI spec
for the given endpoint.

```json /"paths"/ /"components"/ /"pattern"/
::: collapse
11
21
41
53
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
                "required": [
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

It may seem a bit overwhelming at first but basically there are 2 main sections.

1. paths section where you define all the endpoints you have.
2. the components section where you define all the payload structures.

## Code-first approach

People don't usually write OpenAPI spec's directly as they are verbose and
annoying to maintain.

One approach is to write code and have a framework generate the OpenAPI spec for
you. In rust a popular library for this is [`utoipa`](https://docs.rs/utoipa/latest/utoipa/).

With `utoipa` you can write something like the following:

```rs
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
let spec = ApiDoc::openapi();
let spec_json = serde_json::to_string(&spec).unwrap();
```

Validation here is disconnected from the schema. Even though we
declare that `#[schema(pattern = r"^hello:")]` we never actually enforce this
in our implementation. [`validator`](https://docs.rs/validator)
allows you to annotate the structs to enforce the checks.

```rs {13,31}
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
