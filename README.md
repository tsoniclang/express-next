# express-next

Native Tsonic source-of-truth port of Express.

## Current phase

This repo starts the replacement for the current `express-clr` + generated `express` split.

The initial slice in this repo ports the host-independent core:

- router pipeline
- route chaining
- mount/export behavior
- param handlers
- application settings and render hooks
- core response helpers

The remaining host-bound substrate (`listen`, transport/file adapters, multipart/filesystem hooks) will be layered in next.
