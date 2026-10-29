// Renders doomai-promo.html frame by frame with headless Chrome, then encodes an MP4 with ffmpeg.
//
//   TOOLS_DIR=<dir with node_modules/puppeteer-core> FFMPEG=<path to ffmpeg> node capture.mjs [--stills 0.5,4,7,9.5]
//
// Output: doomai-promo.mp4 (1920×1080, 30 fps, 10 s) next to this file.
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(process.env.TOOLS_DIR ?? here, "noop.js"));
const puppeteer = require("puppeteer-core");

const CHROME = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const FPS = 30;
const SECONDS = 10;
const stillsArg = process.argv.indexOf("--stills");
const stills = stillsArg > 0 ? process.argv[stillsArg + 1].split(",").map(Number) : null;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--hide-scrollbars"] });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(join(here, "doomai-promo.html")).href, { waitUntil: "networkidle0" });
await page.evaluate(async () => {
  window.__driven = true;
  await document.fonts.ready;
  await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
});

const shoot = async (t, file) => {
  await page.evaluate((t) => window.render(t), t);
  await page.screenshot({ path: file, type: "png" });
};

if (stills) {
  for (const t of stills) await shoot(t, join(here, `still-${t}.png`));
  console.log("stills written");
} else {
  const frames = join(here, "frames");
  rmSync(frames, { recursive: true, force: true });
  mkdirSync(frames);
  const total = FPS * SECONDS;
  for (let f = 0; f < total; f++) {
    await shoot(f / FPS, join(frames, `f${String(f).padStart(4, "0")}.png`));
    if (f % 30 === 0) console.log(`frame ${f}/${total}`);
  }
  const out = join(here, "doomai-promo.mp4");
  execFileSync(process.env.FFMPEG ?? "ffmpeg", [
    "-y", "-framerate", String(FPS), "-i", join(frames, "f%04d.png"),
    "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out,
  ], { stdio: "inherit" });
  rmSync(frames, { recursive: true, force: true });
  console.log("wrote", out);
}
await browser.close();
