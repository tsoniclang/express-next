import type { Application } from "./application.js";
import { Params } from "./params.js";
import type { Route } from "./route.js";
import type { TransportRequest } from "./types.js";

export class Request {
  readonly #transport: TransportRequest;
  readonly #headers: Record<string, string> = {};

  app?: Application;
  baseUrl: string = "";
  body: unknown = undefined;
  method: string = "GET";
  originalUrl: string = "/";
  readonly params: Params = new Params();
  path: string = "/";
  query: Record<string, unknown> = {};
  route?: Route;

  constructor(transport: TransportRequest, app?: Application) {
    this.#transport = transport;
    this.app = app;
    this.method = transport.method;
    this.path = transport.path;
    this.originalUrl = transport.path;
    this.query = transport.query ?? {};

    const headers = transport.headers ?? {};
    for (const key in headers) {
      this.#headers[key.toLowerCase()] = headers[key]!;
    }
  }

  get transport(): TransportRequest {
    return this.#transport;
  }

  get(name: string): string | undefined {
    return readHeader(this.#headers, name.toLowerCase());
  }

  header(name: string): string | undefined {
    return this.get(name);
  }

  param(name: string): string | undefined {
    return this.params.get(name);
  }

  setParam(name: string, value: unknown): void {
    this.params.set(name, value);
  }

  entries(): [string, string][] {
    return this.params.entries();
  }
}

function readHeader(
  headers: Record<string, string>,
  name: string
): string | undefined {
  for (const currentKey in headers) {
    if (currentKey === name) {
      return headers[currentKey];
    }
  }

  return undefined;
}
