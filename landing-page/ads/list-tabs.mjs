#!/usr/bin/env node
import puppeteer from 'puppeteer-core';

async function main() {
    const resp = await fetch('http://localhost:9222/json/version');
    const data = await resp.json();
    const browser = await puppeteer.connect({ browserWSEndpoint: data.webSocketDebuggerUrl });
    const pages = await browser.pages();
    pages.forEach((p, i) => {
        console.log(`Tab ${i}: ${p.url().substring(0, 120)}`);
    });
}

main().catch(e => console.error('ERROR:', e.message));
