#!/usr/bin/env node
/**
 * Screenshot ad creatives → PNG
 * Usage: node screenshot.mjs [--cdp ws://localhost:9222]
 *
 * Generates 1080x1080 (feed) and 1080x1920 (story) for each creative.
 * Uses puppeteer-core with Brave CDP connection.
 */

import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, 'output');

const CREATIVES = [
    { name: 'creative-1-before-after', file: 'creative-1-before-after.html' },
    { name: 'creative-2-price', file: 'creative-2-price.html' },
];

const SIZES = [
    { suffix: 'feed', width: 1080, height: 1080 },
    { suffix: 'story', width: 1080, height: 1920 },
];

async function main() {
    if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

    // Connect to Brave CDP or launch headless
    const cdpArg = process.argv.find(a => a.startsWith('ws://'));
    let browser;
    if (cdpArg) {
        browser = await puppeteer.connect({ browserWSEndpoint: cdpArg });
        console.log('Connected to Brave CDP');
    } else {
        // Try default Brave CDP
        try {
            const resp = await fetch('http://localhost:9222/json/version');
            const data = await resp.json();
            browser = await puppeteer.connect({ browserWSEndpoint: data.webSocketDebuggerUrl });
            console.log('Connected to Brave CDP (auto-detect)');
        } catch {
            console.error('No Brave CDP found. Launch Brave with --remote-debugging-port=9222');
            process.exit(1);
        }
    }

    for (const creative of CREATIVES) {
        for (const size of SIZES) {
            const page = await browser.newPage();
            await page.setViewport({ width: size.width, height: size.height, deviceScaleFactor: 1 });

            const filePath = `file://${join(__dirname, creative.file)}`;
            await page.goto(filePath, { waitUntil: 'networkidle0', timeout: 15000 });

            // Wait for fonts
            await page.evaluate(() => document.fonts.ready);
            await new Promise(r => setTimeout(r, 500));

            const outPath = join(OUTPUT_DIR, `${creative.name}-${size.suffix}.png`);
            await page.screenshot({ path: outPath, type: 'png', clip: { x: 0, y: 0, width: size.width, height: size.height } });
            console.log(`Saved: ${outPath}`);

            await page.close();
        }
    }

    if (cdpArg || true) {
        // Don't disconnect if using CDP (keep Brave session alive)
        console.log('Done! Screenshots saved to output/');
    }
}

main().catch(e => { console.error(e); process.exit(1); });
