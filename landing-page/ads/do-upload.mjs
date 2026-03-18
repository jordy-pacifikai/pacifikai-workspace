#!/usr/bin/env node
import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
    const resp = await fetch('http://localhost:9222/json/version');
    const data = await resp.json();
    const browser = await puppeteer.connect({ browserWSEndpoint: data.webSocketDebuggerUrl });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes('adsmanager') || p.url().includes('facebook.com/ads'));
    if (!page) { console.log('No AdsManager tab'); return; }

    const filePath = process.argv[2] || path.resolve(__dirname, 'output/creative-1-before-after-feed.png');
    console.log('Will upload:', filePath);

    // Set up filechooser listener BEFORE clicking
    const fileChooserPromise = page.waitForFileChooser({ timeout: 10000 }).catch(() => null);

    // Click the "+ Importer" button precisely
    // The button is at the top right of the media section
    await page.mouse.click(713, 197);
    console.log('Clicked import button area');

    const fileChooser = await fileChooserPromise;
    if (fileChooser) {
        await fileChooser.accept([filePath]);
        console.log('File accepted by chooser!');
    } else {
        console.log('No file chooser appeared. Trying alternative: find file input');
        // Check for file inputs that may have been added
        await sleep(1000);
        const fileInputs = await page.$$('input[type="file"]');
        console.log('File inputs found:', fileInputs.length);
        if (fileInputs.length > 0) {
            await fileInputs[fileInputs.length - 1].uploadFile(filePath);
            console.log('Uploaded via file input');
        }
    }

    await sleep(5000);
    await page.screenshot({ path: '/tmp/ads-uploaded.jpg', type: 'jpeg', quality: 70 });
    console.log('Screenshot: /tmp/ads-uploaded.jpg');
}

main().catch(e => console.error('ERROR:', e.message));
