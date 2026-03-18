#!/usr/bin/env node
/**
 * Create Facebook Ad Campaign via Brave CDP
 * Step-by-step: Click Create → Select objective → Configure audience → Set budget
 */

import puppeteer from 'puppeteer-core';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getAdsPage(browser) {
    const pages = await browser.pages();
    return pages.find(p => p.url().includes('adsmanager'));
}

async function clickByText(page, text) {
    const elements = await page.$$('button, [role="button"], a, [role="link"], div[tabindex="0"]');
    for (const el of elements) {
        const elText = await page.evaluate(e => e.innerText?.trim(), el);
        if (elText === text || elText?.startsWith(text)) {
            await el.click();
            return true;
        }
    }
    return false;
}

async function getPageText(page, maxLen = 2000) {
    return page.evaluate((ml) => document.body?.innerText?.substring(0, ml), maxLen);
}

async function main() {
    const resp = await fetch('http://localhost:9222/json/version');
    const data = await resp.json();
    const browser = await puppeteer.connect({ browserWSEndpoint: data.webSocketDebuggerUrl });

    let page = await getAdsPage(browser);
    if (!page) {
        console.log('Opening Ads Manager...');
        page = await browser.newPage();
        await page.goto('https://adsmanager.facebook.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await sleep(5000);
    }

    const step = process.argv[2] || 'info';

    switch (step) {
        case 'info': {
            const text = await getPageText(page, 2000);
            console.log('=== CURRENT PAGE ===');
            console.log('URL:', page.url());
            console.log(text);
            break;
        }

        case 'click-create': {
            const clicked = await clickByText(page, 'Créer');
            console.log('Clicked Créer:', clicked);
            await sleep(3000);
            const text = await getPageText(page, 2000);
            console.log(text);
            break;
        }

        case 'screenshot': {
            const path = process.argv[3] || '/tmp/ads-manager.jpg';
            await page.screenshot({ path, type: 'jpeg', quality: 70 });
            console.log('Screenshot saved:', path);
            break;
        }

        case 'click': {
            const target = process.argv[3];
            if (!target) { console.log('Usage: node create-campaign.mjs click "Button Text"'); break; }
            const clicked = await clickByText(page, target);
            console.log(`Clicked "${target}":`, clicked);
            await sleep(2000);
            const text = await getPageText(page, 2000);
            console.log(text);
            break;
        }

        case 'eval': {
            const expr = process.argv[3];
            if (!expr) { console.log('Usage: node create-campaign.mjs eval "js expression"'); break; }
            const result = await page.evaluate(expr);
            console.log(JSON.stringify(result, null, 2));
            break;
        }

        default:
            console.log('Commands: info, click-create, screenshot, click "text", eval "js"');
    }
}

main().catch(e => console.error('ERROR:', e.message));
