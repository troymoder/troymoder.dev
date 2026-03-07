default:
    @just --list

fmt:
    dprint fmt
    just --unstable --fmt
    nix fmt .

lint:
    pnpm lint

audit:
    pnpm audit

dev:
    pnpm dev

build:
    pnpm build

preview: build
    miniserve dist --index index.html --port 4321
