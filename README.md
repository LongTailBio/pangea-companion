# Pangea Companion

Uppy Companion server for handling S3 uploads.

## Getting Started

**Configure**

```sh
cp .env.example .env
```

**Run**

```sh
yarn start
```

## Development

### Releases

`pangea-companion` uses [`standard-version`](https://github.com/conventional-changelog/standard-version) to manage releases.

```sh
yarn release
```

For all options see [CLI Usage](https://github.com/conventional-changelog/standard-version#cli-usage)

## Deploying

Pangea Companion expects to be run behind a SSL-terminating proxy in production.
