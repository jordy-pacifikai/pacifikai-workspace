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

    // Step 1: Uncheck whatever is checked, then check only our brouillon
    // Find all checkbox elements in the table rows
    const result = await page.evaluate(() => {
        const rows = [];
        // Find all table rows with checkboxes
        const checkboxes = document.querySelectorAll('input[type="checkbox"], [role="checkbox"]');
        for (const cb of checkboxes) {
            const rect = cb.getBoundingClientRect();
            if (rect.width < 5) continue;
            // Find the text in the same row
            let parent = cb;
            for (let i = 0; i < 10; i++) {
                parent = parent.parentElement;
                if (!parent) break;
                const text = parent.innerText?.trim();
                if (text && text.length > 20) {
                    const checked = cb.checked || cb.getAttribute('aria-checked') === 'true';
                    rows.push({ text: text.substring(0, 60), checked, y: Math.round(rect.y) });
                    break;
                }
            }
        }
        return rows;
    });
    console.log('Checkboxes:', JSON.stringify(result, null, 2));

    // Step 2: Uncheck all, then check only the brouillon row
    await page.evaluate(() => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"], [role="checkbox"]');
        for (const cb of checkboxes) {
            const rect = cb.getBoundingClientRect();
            if (rect.width < 5) continue;
            const checked = cb.checked || cb.getAttribute('aria-checked') === 'true';
            if (checked) {
                cb.click();
            }
        }
    });
    await sleep(500);

    // Now check only the "Nouvel ensemble" row
    await page.evaluate(() => {
        // Find the row containing "Nouvel ensemble de publicités de Prospects"
        const links = document.querySelectorAll('a, span');
        for (const el of links) {
            if (el.textContent?.includes('Nouvel ensemble de publicités de Prospects')) {
                // Navigate up to find the checkbox
                let parent = el;
                for (let i = 0; i < 15; i++) {
                    parent = parent.parentElement;
                    if (!parent) break;
                    const cb = parent.querySelector('input[type="checkbox"], [role="checkbox"]');
                    if (cb) {
                        const rect = cb.getBoundingClientRect();
                        if (rect.width > 5) {
                            cb.click();
                            return 'checked brouillon row';
                        }
                    }
                }
                return 'checkbox not found in row';
            }
        }
        return 'row not found';
    });
    await sleep(1000);

    // Step 3: Now click Modifier button in toolbar
    const buttons = await page.$$('div[role="button"], button');
    for (const btn of buttons) {
        const info = await page.evaluate(e => ({
            text: e.innerText?.trim(),
            label: e.getAttribute('aria-label'),
            y: Math.round(e.getBoundingClientRect().y),
            w: Math.round(e.getBoundingClientRect().width),
        }), btn);
        if (info.text === 'Modifier' && info.y > 190 && info.y < 250 && info.w > 50) {
            await btn.click();
            console.log('Clicked Modifier at y=' + info.y);
            break;
        }
    }
    await sleep(5000);
    await page.screenshot({ path: '/tmp/ads-editing.jpg', type: 'jpeg', quality: 70 });
    console.log('Screenshot: /tmp/ads-editing.jpg');
}

main().catch(e => console.error('ERROR:', e.message));
