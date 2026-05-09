import "server-only";

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function getFilePath(file: string) {
  return path.join(DATA_DIR, file);
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
