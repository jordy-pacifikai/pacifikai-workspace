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

    const step = process.argv[2] || 'click-prospects';

    if (step === 'click-prospects') {
        // Find the radio button row containing "Prospects" text and click the radio input or parent row
        const clicked = await page.evaluate(() => {
            // Strategy 1: find all elements with "Prospects" text and click the closest interactive parent
            const all = document.querySelectorAll('*');
            for (const el of all) {
                if (el.childNodes.length === 1 && el.textContent.trim() === 'Prospects') {
                    // Found the text node container, now find the clickable row
                    let row = el.closest('[role="radio"], [role="listitem"], [role="option"]');
                    if (row) { row.click(); return 'clicked role=' + row.getAttribute('role'); }
                    // Try clicking the parent div that looks like a row
                    let parent = el.parentElement;
                    for (let i = 0; i < 5; i++) {
                        if (!parent) break;
                        const style = getComputedStyle(parent);
                        const rect = parent.getBoundingClientRect();
                        // Look for a row-like container (width > 200, has cursor pointer or is clickable)
                        if (rect.width > 200 && rect.height > 30 && rect.height < 80) {
                            parent.click();
                            return 'clicked parent level ' + i + ' tag=' + parent.tagName + ' w=' + Math.round(rect.width);
                        }
                        parent = parent.parentElement;
                    }
                    // Last resort: just click the text element itself
                    el.click();
                    return 'clicked text element directly';
                }
            }
            return 'not found';
        });
        console.log('Result:', clicked);
        await sleep(1500);

        // Take screenshot to see result
        await page.screenshot({ path: '/tmp/ads-prospects.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-prospects.jpg');
    }

    if (step === 'click-continuer') {
        // Click the blue "Continuer" button
        const buttons = await page.$$('button, [role="button"], div[tabindex="0"]');
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.innerText?.trim(), btn);
            if (text === 'Continuer') {
                await btn.click();
                console.log('Clicked Continuer');
                break;
            }
        }
        await sleep(4000);
        await page.screenshot({ path: '/tmp/ads-after-continuer.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-after-continuer.jpg');
    }

    if (step === 'debug-radio') {
        // Debug: list all elements near "Prospects" text
        const info = await page.evaluate(() => {
            const results = [];
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
            while (walker.nextNode()) {
                if (walker.currentNode.textContent.trim() === 'Prospects') {
                    let node = walker.currentNode.parentElement;
                    for (let i = 0; i < 8 && node; i++) {
                        const rect = node.getBoundingClientRect();
                        results.push({
                            level: i,
                            tag: node.tagName,
                            role: node.getAttribute('role'),
                            classes: node.className?.substring?.(0, 60),
                            w: Math.round(rect.width),
                            h: Math.round(rect.height),
                            tabindex: node.getAttribute('tabindex'),
                            'aria-checked': node.getAttribute('aria-checked'),
                        });
                        node = node.parentElement;
                    }
                    break;
                }
            }
            return results;
        });
        console.log(JSON.stringify(info, null, 2));
    }
}

main().catch(e => console.error('ERROR:', e.message));
