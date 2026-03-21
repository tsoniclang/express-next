import type { MultipartField, MultipartOptions } from "../options.js";
import type { Request } from "../request.js";
import type { Response } from "../response.js";
import type { NextFunction, RequestHandler } from "../types.js";

// TODO: import { UploadedFile, TransportFile } from "../request/uploaded-file.js";
// TODO: import { Files } from "../request/files.js";
// The actual parsing depends on a transport-level multipart parser
// (e.g. busboy / formidable). The methods below produce `RequestHandler`
// functions that will be wired once the transport adapter is available.

/**
 * Express-shaped multipart middleware factory.
 *
 * Mirrors the CLR `Multipart` class: construct with options, then call
 * `.any()`, `.none()`, `.single(name)`, `.array(name)`, or `.fields(fields)`
 * to get a middleware handler.
 */
export class Multipart {
  readonly #options: Required<Pick<MultipartOptions, "type">> &
    Omit<MultipartOptions, "type">;

  constructor(options?: MultipartOptions) {
    this.#options = {
      type: options?.type ?? "multipart/form-data",
      maxFileCount: options?.maxFileCount,
      maxFileSizeBytes: options?.maxFileSizeBytes,
    };
  }

  /** Accept any files (no field-name constraints). */
  any(): RequestHandler {
    return async (req: Request, _res: Response, next: NextFunction) => {
      await parse(req, MultipartMode.Any, undefined, next, this.#options);
    };
  }

  /** Accept the form but reject any file uploads. */
  none(): RequestHandler {
    return async (req: Request, _res: Response, next: NextFunction) => {
      await parse(req, MultipartMode.None, undefined, next, this.#options);
    };
  }

  /** Accept a single file on field `name`. */
  single(name: string): RequestHandler {
    const allowList: MultipartField[] = [{ name, maxCount: 1 }];
    return async (req: Request, _res: Response, next: NextFunction) => {
      await parse(req, MultipartMode.Single, allowList, next, this.#options);
    };
  }

  /** Accept multiple files on a single field `name`, with optional cap. */
  array(name: string, maxCount?: number): RequestHandler {
    const allowList: MultipartField[] = [{ name, maxCount }];
    return async (req: Request, _res: Response, next: NextFunction) => {
      await parse(req, MultipartMode.Fields, allowList, next, this.#options);
    };
  }

  /** Accept files according to the given field specification. */
  fields(fields: MultipartField[]): RequestHandler {
    return async (req: Request, _res: Response, next: NextFunction) => {
      await parse(req, MultipartMode.Fields, fields, next, this.#options);
    };
  }
}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

const enum MultipartMode {
  Any = "any",
  None = "none",
  Single = "single",
  Fields = "fields",
}

type ParseOptions = Required<Pick<MultipartOptions, "type">> &
  Omit<MultipartOptions, "type">;

// ---------------------------------------------------------------------------
// Core parse logic
//
// TODO: The actual body-stream parsing is transport-dependent. This
// skeleton validates the content-type and invokes `next` so that the
// middleware can be registered in the router today; the real I/O will
// be filled in when the Node.js transport adapter (busboy / formidable)
// is wired.
// ---------------------------------------------------------------------------

async function parse(
  req: Request,
  _mode: MultipartMode,
  _allowList: MultipartField[] | undefined,
  next: NextFunction,
  options: ParseOptions
): Promise<void> {
  const contentType = req.get("content-type") ?? "";

  if (
    contentType.length === 0 ||
    !contentType.toLowerCase().includes(options.type.toLowerCase())
  ) {
    await next(undefined);
    return;
  }

  // TODO: read the multipart stream from req.transport, parse fields/files,
  //       populate req.body / req.file / req.files, and enforce limits
  //       (options.maxFileCount, options.maxFileSizeBytes, allowList per-field maxCount).
  //
  //       For now, fall through so the middleware can be mounted without error.

  await next(undefined);
}
