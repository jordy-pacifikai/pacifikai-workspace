#!/usr/bin/env node
import puppeteer from 'puppeteer-core';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
    const resp = await fetch('http://localhost:9222/json/version');
    const data = await resp.json();
    const browser = await puppeteer.connect({ browserWSEndpoint: data.webSocketDebuggerUrl });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes('adsmanager'));
    if (page === undefined) { console.log('No AdsManager tab'); return; }

    const step = process.argv[2] || 'close-and-create';

    if (step === 'close-and-create') {
        // Close the vue panel
        const closeButtons = await page.$$('[aria-label="Fermer"], [aria-label="Close"], [aria-label="close"]');
        for (const btn of closeButtons) {
            const vis = await page.evaluate(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }, btn);
            if (vis) { await btn.click(); console.log('Closed panel'); break; }
        }
        await sleep(1500);

        // Find and click the green + Créer button (has specific data-testid or is the first matching in toolbar)
        const buttons = await page.$$('div[role="button"], button, span[role="button"]');
        let clicked = false;
        for (const btn of buttons) {
            const info = await page.evaluate(el => {
                const text = el.innerText?.trim();
                const rect = el.getBoundingClientRect();
                const bg = getComputedStyle(el).backgroundColor;
                const testid = el.getAttribute('data-testid');
                return { text, x: rect.x, y: rect.y, w: rect.width, h: rect.height, bg, testid };
            }, btn);
            // The green Créer button is typically in the toolbar area (y between 150-300) and has green bg
            if ((info.text === 'Créer' || info.text === '+ Créer') && info.y > 100 && info.y < 350 && info.w > 50) {
                console.log('Clicking green Créer:', JSON.stringify(info));
                await btn.click();
                clicked = true;
                break;
            }
        }
        if (clicked === false) {
            console.log('Could not find green Créer button, listing all Créer buttons:');
            for (const btn of buttons) {
                const text = await page.evaluate(el => el.innerText?.trim(), btn);
                if (text && text.includes('Créer')) {
                    const rect = await page.evaluate(el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width }; }, btn);
                    console.log(`  "${text}" at y=${rect.y} w=${rect.w}`);
                }
            }
        }
        await sleep(4000);
    }

    if (step === 'screenshot') {
        const path = process.argv[3] || '/tmp/ads-step.jpg';
        await page.screenshot({ path, type: 'jpeg', quality: 70 });
        console.log('Screenshot:', path);
        return;
    }

    if (step === 'text') {
        const text = await page.evaluate(() => document.body?.innerText?.substring(0, 3000));
        console.log(text);
        return;
    }

    if (step === 'click') {
        const target = process.argv[3];
        const buttons = await page.$$('div[role="button"], button, span[role="button"], a, [role="link"], [role="radio"], [role="tab"], label');
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.innerText?.trim(), btn);
            if (text === target) { await btn.click(); console.log('Clicked:', target); break; }
        }
        await sleep(2000);
        const pageText = await page.evaluate(() => document.body?.innerText?.substring(0, 3000));
        console.log(pageText);
        return;
    }

    // After clicking Créer, take screenshot to see what opened
    await page.screenshot({ path: '/tmp/ads-step.jpg', type: 'jpeg', quality: 70 });
    console.log('Screenshot saved: /tmp/ads-step.jpg');
    const text = await page.evaluate(() => document.body?.innerText?.substring(0, 2000));
    console.log(text);
}

main().catch(e => console.error('ERROR:', e.message));
