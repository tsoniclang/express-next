import test from "node:test";
import assert from "node:assert/strict";

import { express } from "../../src/index.js";
import { createContext } from "../helpers/memory-context.js";

// NOTE: The CLR version tests bundled middleware (cookieParser, cors, multipart)
// which are not yet implemented in express-next. These tests verify the
// equivalent behavior using the primitives available in the native runtime.

test("response cookie sets set-cookie header with path option", async () => {
  const app = express.create();
  app.get("/set", (_req, res) => {
    res.cookie("sid", "abc", { path: "/" });
    res.send("ok");
  });

  const context = createContext("GET", "/set");
  await app.handle(context, app);

  const header = context.response.getHeader("set-cookie") ?? "";
  assert.match(header, /sid=abc/);
  assert.match(header, /Path=\//);
});

test("response cookie serializes object values as json", async () => {
  const app = express.create();
  app.get("/obj", (_req, res) => {
    res.cookie("data", { a: 1 });
    res.send("ok");
  });

  const context = createContext("GET", "/obj");
  await app.handle(context, app);

  const header = context.response.getHeader("set-cookie") ?? "";
  assert.match(header, /data=/);
});

test("response cookie includes domain and maxage options", async () => {
  const app = express.create();
  app.get("/opts", (_req, res) => {
    res.cookie("sid", "abc", {
      domain: "example.com",
      maxAge: 30000,
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      priority: "high"
    });
    res.send("ok");
  });

  const context = createContext("GET", "/opts");
  await app.handle(context, app);

  const header = context.response.getHeader("set-cookie") ?? "";
  assert.match(header, /Domain=example\.com/);
  assert.match(header, /HttpOnly/);
  assert.match(header, /Secure/);
  assert.match(header, /SameSite=Strict/);
  assert.match(header, /Priority=high/);
});
