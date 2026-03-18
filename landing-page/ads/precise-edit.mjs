#!/usr/bin/env node
import puppeteer from 'puppeteer-core';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
    const resp = await fetch('http://localhost:9222/json/version');
    const data = await resp.json();
    const browser = await puppeteer.connect({ browserWSEndpoint: data.webSocketDebuggerUrl });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes('adsmanager'));
    if (!page) { console.log('No AdsManager tab'); return; }

    const step = process.argv[2] || 'deselect-all';

    if (step === 'deselect-all') {
        // Click the header checkbox to toggle select-all off
        // Header checkbox is in the column header row
        const cbs = await page.$$('input[type="checkbox"]');
        for (const cb of cbs) {
            const box = await cb.boundingBox();
            if (box && box.y < 290 && box.y > 240 && box.width > 5) {
                // This is the header checkbox
                const checked = await page.evaluate(el => el.checked, cb);
                if (checked) {
                    await cb.click();
                    console.log('Unchecked header at y=' + Math.round(box.y));
                }
                break;
            }
        }
        await sleep(1000);
        await page.screenshot({ path: '/tmp/ads-deselect.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-deselect.jpg');
    }

    if (step === 'select-first-row') {
        // Click the checkbox of the first data row (our PACIFIKAI campaign)
        // The first row checkbox should be around y=300-310
        const cbs = await page.$$('input[type="checkbox"]');
        for (const cb of cbs) {
            const box = await cb.boundingBox();
            if (box && box.y > 290 && box.y < 330 && box.width > 5) {
                await cb.click();
                console.log('Clicked first row checkbox at y=' + Math.round(box.y));
                break;
            }
        }
        await sleep(1000);
        await page.screenshot({ path: '/tmp/ads-selected.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-selected.jpg');
    }

    if (step === 'click-pencil') {
        // Click the pencil/edit icon button in toolbar
        // It has aria-label containing "Modifier" and is a small icon button
        const buttons = await page.$$('[aria-label*="Modifier"], [aria-label*="Edit"]');
        for (const btn of buttons) {
            const box = await btn.boundingBox();
            if (box && box.y > 200 && box.y < 250 && box.width < 60) {
                await btn.click();
                console.log('Clicked pencil at', Math.round(box.x), Math.round(box.y));
                break;
            }
        }
        await sleep(5000);
        await page.screenshot({ path: '/tmp/ads-edit-panel.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-edit-panel.jpg');
    }

    if (step === 'screenshot') {
        const path = process.argv[3] || '/tmp/ads-state.jpg';
        await page.screenshot({ path, type: 'jpeg', quality: 70 });
        console.log('Screenshot:', path);
    }
}

main().catch(e => console.error('ERROR:', e.message));
