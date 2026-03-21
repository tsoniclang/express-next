import type { Readable } from "node:stream";

/**
 * Represents a single file received via a multipart upload.
 *
 * The transport layer (e.g. busboy, formidable, the Node http adapter)
 * provides the underlying stream / buffer behind `TransportFile`.
 */
export interface TransportFile {
  /** Form field name this file was submitted under. */
  readonly fieldname: string;
  /** Original filename on the client machine. */
  readonly originalname: string;
  /** MIME type reported by the client. */
  readonly mimetype: string;
  /** Size in bytes (may be 0 until the stream has been fully consumed). */
  readonly size: number;
  /** Return a readable stream for the file contents. */
  stream(): Readable;
  /** Return the full file contents as a buffer. */
  buffer(): Promise<Buffer>;
}

export class UploadedFile {
  readonly #transport: TransportFile;

  readonly fieldname: string;
  readonly originalname: string;
  readonly mimetype: string;
  readonly size: number;

  /** @internal */
  constructor(transport: TransportFile) {
    this.#transport = transport;
    this.fieldname = transport.fieldname;
    this.originalname = transport.originalname;
    this.mimetype = transport.mimetype;
    this.size = transport.size;
  }

  /** Return the file contents as a `Uint8Array`. */
  async bytes(): Promise<Uint8Array> {
    const buf = await this.#transport.buffer();
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }

  /** Return the file contents decoded as UTF-8 text. */
  async text(): Promise<string> {
    const buf = await this.#transport.buffer();
    return buf.toString("utf-8");
  }

  /**
   * Write the uploaded file to `path` on disk.
   *
   * TODO: wire to the host fs layer once the transport adapter lands.
   */
  async save(path: string): Promise<void> {
    // TODO: implement via node:fs/promises.writeFile once the transport adapter is available
    const fs = await import("node:fs/promises");
    const buf = await this.#transport.buffer();
    await fs.writeFile(path, buf);
  }

  /** @internal – expose the underlying readable for piping. */
  stream(): Readable {
    return this.#transport.stream();
  }
}
