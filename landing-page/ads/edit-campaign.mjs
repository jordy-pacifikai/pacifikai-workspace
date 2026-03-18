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

    const step = process.argv[2] || 'go-campaigns';

    if (step === 'go-campaigns') {
        // Navigate to campaigns tab
        await page.goto('https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=471415823772548', {
            waitUntil: 'domcontentloaded',
            timeout: 20000,
        });
        await sleep(5000);
        await page.screenshot({ path: '/tmp/ads-campaigns.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-campaigns.jpg');
    }

    if (step === 'select-and-edit') {
        // 1. Check our campaign checkbox
        const checked = await page.evaluate(() => {
            const rows = document.querySelectorAll('a, span');
            for (const el of rows) {
                if (el.textContent?.includes('PACIFIKAI - Site Web 100K')) {
                    let parent = el;
                    for (let i = 0; i < 15; i++) {
                        parent = parent.parentElement;
                        if (!parent) break;
                        const cb = parent.querySelector('input[type="checkbox"]');
                        if (cb && cb.getBoundingClientRect().width > 5) {
                            if (!cb.checked) cb.click();
                            return true;
                        }
                    }
                }
            }
            return false;
        });
        console.log('Checked:', checked);
        await sleep(1000);

        // 2. Click Modifier button
        const result = await page.evaluate(() => {
            const btns = document.querySelectorAll('div[role="button"], button');
            for (const btn of btns) {
                if (btn.innerText?.trim() === 'Modifier') {
                    const rect = btn.getBoundingClientRect();
                    if (rect.width > 60 && rect.y > 150) {
                        btn.click();
                        return 'clicked Modifier at y=' + Math.round(rect.y);
                    }
                }
            }
            return 'Modifier not found';
        });
        console.log(result);
        await sleep(5000);
        await page.screenshot({ path: '/tmp/ads-editing.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-editing.jpg');
    }

    if (step === 'screenshot') {
        await page.screenshot({ path: '/tmp/ads-campaigns.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot saved');
    }

    if (step === 'text') {
        const text = await page.evaluate(() => document.body?.innerText?.substring(0, 5000));
        console.log(text);
    }
}

main().catch(e => console.error('ERROR:', e.message));
