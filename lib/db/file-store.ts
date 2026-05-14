import "server-only";

import fs from "fs";
import path from "path";
import { validateSlug } from "@/lib/validate";

const DATA_DIR = path.join(process.cwd(), "data");

export function safeFilename(slug: string): string {
  if (!validateSlug(slug)) {
    throw new Error("Invalid slug.");
  }

  return slug;
}

function safeDataFile(file: string) {
  if (
    !/^(tenant|releases|subscribers)-[a-z0-9-]{1,60}\.json$/.test(file)
  ) {
    throw new Error("Invalid data file.");
  }

  return file;
}

function getFilePath(file: string) {
  return path.join(DATA_DIR, safeDataFile(file));
}

export function read<T>(file: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(getFilePath(file), "utf8")) as T;
  } catch {
    return null;
  }
}

export function write<T>(file: string, data: T): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(getFilePath(file), JSON.stringify(data, null, 2));
}
