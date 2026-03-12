---
title: Announcing Tinc
date: 2026-03-12
description: A gRPC to REST transcoding library for Rust
tags: ["crate", "grpc", "api", "rust"]
---

Writing accurate and useful documentation is no easy task. The quality
of documentation is often a deciding factor when picking to work with
one technology over another.

When it comes to writing APIs the type of documentation people care about
boils down to the operations available and how to use each operation.

Specifically for REST or HTTP APIs these operations are typically endpoints.

## OpenAPI

The industry standard to describe a REST API is [OpenAPI](https://www.openapis.org/).

OpenAPI is a detailed machine readable specification for declaring endpoints
and how they behave.

Here is a simple service in rust using the Axum crate.

```rs
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
// A valid message
{ "message": "hello:troy" } // [!code ++]

// Invalid messages
{ "not-message": 123 }  // missing fields [!code --]
{ "message": "troy" }   // incorrect prefix [!code --]
{ }                     // empty [!code --]
```

The following would be the corresponding OpenAPI spec
for the given endpoint.

```json /"paths"/ /"components"/ /"pattern"/
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

## Code First Approach

People don't usually write OpenAPI spec's directly as they are verbose and
annoying to maintain.

One approach is to write code and have a framework generates the OpenAPI spec for
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

One issue with this approach is the validation logic of the endpoint is not directly
connected to the schema. We have to specify that the schema requires all messages
start with `hello:` and then have to remember to write that check inside our method.

Another rust library called `validator` which lets us annotate structs

```rs
fn starts_with_hello(
    message: &str,
) -> Result<(), validator::ValidationError> {
    if message.starts_with("hello:") {
        Ok(())
    } else {
        Err(validator::ValidationError::new("must start with hello:"))
    }
}

#[derive(Deserialize, ToSchema, Validate)]
struct PingRequest {
    #[schema(pattern = r"^hello:")]
    #[validate(custom(function = "starts_with_hello"))]
    message: String,
}

// Using it like such
req.validate()?;
```

## Schema First Approach

OpenAPI has a generator called [rust-axum](https://openapi-generator.tech/docs/generators/rust-axum/)
which generates all the structures and method calls to implement the API.
