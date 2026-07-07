#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import path from "node:path";

function usage() {
  return [
    "Usage: node scripts/chrome_cdp_endpoint.mjs [--url]",
    "",
    "Find Chrome's browser-level CDP WebSocket URL from DevToolsActivePort.",
    "",
    "Environment:",
    "  CHROME_CDP_WS_URL      Use this WebSocket URL directly.",
    "  CHROME_CDP_HOST        Host for the generated URL. Default: 127.0.0.1",
    "  CHROME_USER_DATA_DIR   Chrome user-data directory containing DevToolsActivePort.",
  ].join("\n");
}

function defaultUserDataDir() {
  if (process.env.CHROME_USER_DATA_DIR) {
    return process.env.CHROME_USER_DATA_DIR;
  }

  if (platform() === "win32") {
    const localAppData = process.env.LOCALAPPDATA;
    if (localAppData) {
      return path.join(localAppData, "Google", "Chrome", "User Data");
    }
  }

  if (platform() === "darwin") {
    return path.join(homedir(), "Library", "Application Support", "Google", "Chrome");
  }

  return path.join(homedir(), ".config", "google-chrome");
}

function devToolsActivePortPath(userDataDir) {
  return path.join(userDataDir, "DevToolsActivePort");
}

function readEndpoint() {
  if (process.env.CHROME_CDP_WS_URL) {
    return process.env.CHROME_CDP_WS_URL.trim();
  }

  const userDataDir = defaultUserDataDir();
  const activePortPath = devToolsActivePortPath(userDataDir);
  if (!existsSync(activePortPath)) {
    throw new Error(`DevToolsActivePort not found: ${activePortPath}`);
  }

  const lines = readFileSync(activePortPath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) {
    throw new Error(`DevToolsActivePort should contain port and browser path: ${activePortPath}`);
  }

  const [port, browserPath] = lines;
  const host = process.env.CHROME_CDP_HOST || "127.0.0.1";
  return `ws://${host}:${port}${browserPath}`;
}

const args = new Set(process.argv.slice(2));
if (args.has("--help") || args.has("-h")) {
  console.log(usage());
  process.exit(0);
}

if (args.size > 0 && !args.has("--url")) {
  console.error(usage());
  process.exit(2);
}

try {
  console.log(readEndpoint());
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
