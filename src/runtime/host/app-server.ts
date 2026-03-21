/**
 * Represents a running server instance returned by `app.listen()`.
 *
 * Mirrors the Express `Server` surface: `port`, `host`, `path`,
 * `listening`, and `close()`.
 */
export class AppServer {
  readonly #closeAction: (() => void) | undefined;
  readonly #port: number | undefined;
  readonly host: string | undefined;
  readonly path: string | undefined;

  #listening: boolean;

  /** @internal */
  constructor(
    port: number | undefined,
    host: string | undefined,
    path: string | undefined,
    closeAction?: () => void
  ) {
    this.#port = port;
    this.host = host;
    this.path = path;
    this.#closeAction = closeAction;
    this.#listening = true;
  }

  get port(): number | undefined {
    return this.#port;
  }

  get listening(): boolean {
    return this.#listening;
  }

  close(callback?: (error?: Error) => void): void {
    if (!this.#listening) {
      if (callback) {
        callback(undefined);
      }
      return;
    }

    try {
      if (this.#closeAction) {
        this.#closeAction();
      }
      this.#listening = false;
      if (callback) {
        callback(undefined);
      }
    } catch (ex) {
      if (callback) {
        callback(
          ex instanceof Error ? ex : new Error(String(ex))
        );
      }
    }
  }
}
