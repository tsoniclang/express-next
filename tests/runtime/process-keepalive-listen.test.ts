import test from "node:test";
import assert from "node:assert/strict";

import { express, Application } from "../../src/index.js";

// NOTE: The CLR version tests ProcessKeepAlive and listen/close lifecycle.
// In the native Node.js runtime, express-next does not yet expose listen()
// or AppServer. These tests verify the Application instance is created
// correctly and the basic lifecycle methods are available.

test("application can be created and exposes router property", () => {
  const app = express.create();
  assert.ok(app instanceof Application);
  assert.equal(app.router, app);
});

test("application settings survive enable disable cycle", () => {
  const app = express.create();

  app.enable("keep-alive");
  assert.equal(app.enabled("keep-alive"), true);

  app.disable("keep-alive");
  assert.equal(app.disabled("keep-alive"), true);
  assert.equal(app.enabled("keep-alive"), false);
});

test("mountpath defaults to slash", () => {
  const app = express.create();
  assert.equal(app.mountpath, "/");
});

test("set and get round trip arbitrary settings", () => {
  const app = express.create();

  app.set("port", 3000);
  assert.equal(app.get("port"), 3000);

  app.set("host", "127.0.0.1");
  assert.equal(app.get("host"), "127.0.0.1");
});
