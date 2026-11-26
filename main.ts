// news-image-20261126 entry (Node 22, standard library only).
//
// The entry image is the entry.png beside this file: a one-day front page
// summing up the world's news of Thursday 26 November 2026 (38 verified
// stories, drawn with PIL in-session — see the build session, not this
// repo). This program copies those exact bytes to the grader's output
// directory, after checking the gate caps itself: a whole PNG, at most
// 1 MiB and at most 1024 by 1024 pixels. No network, no randomness, so
// two runs write identical bytes.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MAX_BYTES = 1048576;
const MAX_SIDE = 1024;

const src = new URL("./entry.png", import.meta.url);
const bytes = readFileSync(src);

// The image is fixed bytes in the repo: no drawing, no time, no network,
// so the grader's two runs cannot differ.
if (bytes.length === 0) {
  throw new Error("entry.png is empty");
}

if (bytes.length > MAX_BYTES) {
  throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB cap`);
}
if (!bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
  throw new Error("entry.png is not a PNG (bad signature)");
}
if (bytes.readUInt32BE(12) !== 0x49484452) {
  throw new Error("entry.png has no IHDR chunk where a PNG must");
}
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width > MAX_SIDE || height > MAX_SIDE) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 cap`);
}
if (bytes.readUInt32BE(bytes.length - 12) !== 0 ||
    bytes.subarray(bytes.length - 8, bytes.length - 4).toString("ascii") !== "IEND") {
  throw new Error("entry.png has no IEND chunk — not a whole image");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.png"), bytes);
