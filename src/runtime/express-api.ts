import { Application } from "./application.js";
import type { TransportContext } from "./types.js";

export const express = {
  create(): Application {
    return new Application();
  },
  app(): Application {
    return new Application();
  },
  application(): Application {
    return new Application();
  },
  async dispatch(app: Application, context: TransportContext): Promise<void> {
    await app.handle(context, app);
  }
};
