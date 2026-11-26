// Entry program for news-image-20261126 (Node 22, standard library only).
//
// It ships one fixed picture of Thursday 26 November 2026: the front page
// in entry.png, 38 verified stories drawn in the build session with PIL.
// The job here is only to hand those bytes to the grader, unchanged, after
// proving they fit the contest limits. Nothing is drawn at run time, nothing
// is fetched, nothing depends on the clock, so the two grading runs agree
// byte for byte.
//
// Run locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const IMAGE_NAME = "entry.png";
const BYTE_LIMIT = 1024 * 1024;
const SIDE_LIMIT = 1024;

function fail(message: string): never {
  throw new Error(`news-image-20261126: ${message}`);
}

function checkPng(image: Buffer): { width: number; height: number } {
  if (image.length === 0) fail("entry.png is empty");
  if (image.length > BYTE_LIMIT) {
    fail(`entry.png is ${image.length} bytes, over the 1 MiB limit`);
  }
  if (image.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    fail("entry.png does not start with the PNG signature");
  }
  if (image.toString("ascii", 12, 16) !== "IHDR") {
    fail("entry.png has no IHDR chunk at offset 12");
  }
  const width = image.readUInt32BE(16);
  const height = image.readUInt32BE(20);
  if (width === 0 || height === 0) fail("entry.png has a zero side");
  if (width > SIDE_LIMIT || height > SIDE_LIMIT) {
    fail(`entry.png is ${width}x${height}, over the 1024x1024 limit`);
  }
  const tail = image.subarray(image.length - 12);
  if (tail.readUInt32BE(0) !== 0 || tail.toString("ascii", 4, 8) !== "IEND") {
    fail("entry.png does not end with a whole IEND chunk");
  }
  return { width, height };
}

const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(here, IMAGE_NAME);
if (!existsSync(sourcePath)) fail("entry.png is missing beside main.ts");
const image = readFileSync(sourcePath);
const size = checkPng(image);

const destination = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(destination, { recursive: true });
writeFileSync(join(destination, IMAGE_NAME), image);
// One line of confirmation; the file itself is the deliverable.
console.log(`wrote ${IMAGE_NAME} (${size.width}x${size.height}, ${image.length} bytes)`);
