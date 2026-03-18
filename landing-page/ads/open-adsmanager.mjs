#!/usr/bin/env node
import puppeteer from 'puppeteer-core';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
    const resp = await fetch('http://localhost:9222/json/version');
    const data = await resp.json();
    const browser = await puppeteer.connect({ browserWSEndpoint: data.webSocketDebuggerUrl });

    // Open Ads Manager in a new tab
    const page = await browser.newPage();
    await page.goto('https://www.facebook.com/adsmanager/manage/campaigns?act=471415823772548', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('Navigated to:', page.url());
    await sleep(3000);
    await page.screenshot({ path: '/tmp/ads-manager.jpg', type: 'jpeg', quality: 70 });
    console.log('Screenshot: /tmp/ads-manager.jpg');
}

main().catch(e => console.error('ERROR:', e.message));
