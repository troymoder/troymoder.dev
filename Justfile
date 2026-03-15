default:
    @just --list

fmt:
    dprint fmt
    just --unstable --fmt
    nix fmt .
    typstyle -i .

lint:
    pnpm lint
    typos

audit:
    pnpm audit

dev:
    pnpm dev --force

build:
    pnpm build

preview: build
    miniserve dist --index index.html --port 4321
