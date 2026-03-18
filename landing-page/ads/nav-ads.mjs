#!/usr/bin/env node
import puppeteer from 'puppeteer-core';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
    const resp = await fetch('http://localhost:9222/json/version');
    const data = await resp.json();
    const browser = await puppeteer.connect({ browserWSEndpoint: data.webSocketDebuggerUrl });
    const pages = await browser.pages();

    const step = process.argv[2] || 'navigate';

    if (step === 'navigate') {
        // Use last tab and navigate it to ads manager
        const page = pages[pages.length - 1];
        console.log('Using tab:', page.url().substring(0, 80));
        await page.goto('https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=471415823772548', {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });
        console.log('URL after nav:', page.url().substring(0, 100));
        await sleep(5000);
        await page.screenshot({ path: '/tmp/ads-nav.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-nav.jpg');
    }

    if (step === 'screenshot') {
        const tabIndex = parseInt(process.argv[3] || pages.length - 1);
        const page = pages[tabIndex];
        await page.screenshot({ path: '/tmp/ads-tab.jpg', type: 'jpeg', quality: 70 });
        console.log('Tab', tabIndex, ':', page.url().substring(0, 80));
        console.log('Screenshot: /tmp/ads-tab.jpg');
    }
}

main().catch(e => console.error('ERROR:', e.message));
