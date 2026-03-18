#!/usr/bin/env node
import puppeteer from 'puppeteer-core';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getPage() {
    const resp = await fetch('http://localhost:9222/json/version');
    const data = await resp.json();
    const browser = await puppeteer.connect({ browserWSEndpoint: data.webSocketDebuggerUrl });
    const pages = await browser.pages();
    return pages.find(p => p.url().includes('adsmanager')) || pages[pages.length - 1];
}

async function main() {
    const page = await getPage();
    if (!page) { console.log('No AdsManager tab'); return; }

    const step = process.argv[2] || 'select-and-edit';

    if (step === 'select-and-edit') {
        // Click checkbox of PACIFIKAI campaign (first row, y~310)
        const cbs = await page.$$('input[type="checkbox"]');
        for (const cb of cbs) {
            const box = await cb.boundingBox();
            if (box && box.y > 290 && box.y < 340 && box.width > 5) {
                await cb.click();
                console.log('Selected row at y=' + Math.round(box.y));
                break;
            }
        }
        await sleep(1500);

        // Click "Modifier" button in toolbar
        const btns = await page.$$('button, div[role="button"], a');
        for (const btn of btns) {
            const text = await page.evaluate(el => el.innerText?.trim(), btn);
            const box = await btn.boundingBox();
            if (text === 'Modifier' && box && box.y > 200 && box.y < 260) {
                await btn.click();
                console.log('Clicked Modifier at y=' + Math.round(box.y));
                break;
            }
        }
        await sleep(5000);
        await page.screenshot({ path: '/tmp/ads-editing.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-editing.jpg');
    }

    if (step === 'click-ad-tab') {
        // Click on "Nouvelle publicité de Prospects" in the breadcrumb at top
        const result = await page.evaluate(() => {
            const els = document.querySelectorAll('a, span, div');
            for (const el of els) {
                const text = el.innerText?.trim();
                const rect = el.getBoundingClientRect();
                if (text && text.includes('Nouvelle publicité') && rect.y > 0 && rect.y < 50 && rect.width > 50) {
                    el.click();
                    return 'clicked: ' + text.substring(0, 40) + ' at y=' + Math.round(rect.y);
                }
            }
            return 'not found';
        });
        console.log(result);
        await sleep(3000);
        await page.screenshot({ path: '/tmp/ads-ad-tab.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-ad-tab.jpg');
    }

    if (step === 'screenshot') {
        const p = process.argv[3] || '/tmp/ads-state.jpg';
        await page.screenshot({ path: p, type: 'jpeg', quality: 70 });
        console.log('Screenshot:', p);
    }

    if (step === 'click-at') {
        const x = parseInt(process.argv[3]);
        const y = parseInt(process.argv[4]);
        await page.mouse.click(x, y);
        await sleep(2000);
        await page.screenshot({ path: '/tmp/ads-click.jpg', type: 'jpeg', quality: 70 });
        console.log('Clicked', x, y);
    }

    if (step === 'text') {
        const text = await page.evaluate(() => document.body?.innerText?.substring(0, 5000));
        console.log(text);
    }

    if (step === 'scroll-down') {
        await page.evaluate(() => {
            const containers = document.querySelectorAll('div');
            for (const d of containers) {
                if (d.scrollHeight > d.clientHeight + 50 && d.clientHeight > 300 && d.clientHeight < 700) {
                    d.scrollBy(0, 400);
                    return;
                }
            }
            window.scrollBy(0, 400);
        });
        await sleep(800);
        await page.screenshot({ path: '/tmp/ads-scroll.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-scroll.jpg');
    }

    if (step === 'scroll-up') {
        await page.evaluate(() => {
            const containers = document.querySelectorAll('div');
            for (const d of containers) {
                if (d.scrollHeight > d.clientHeight + 50 && d.clientHeight > 300 && d.clientHeight < 700) {
                    d.scrollBy(0, -400);
                    return;
                }
            }
            window.scrollBy(0, -400);
        });
        await sleep(800);
        await page.screenshot({ path: '/tmp/ads-scroll.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-scroll.jpg');
    }
}

main().catch(e => console.error('ERROR:', e.message));
