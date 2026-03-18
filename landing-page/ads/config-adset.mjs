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

    const step = process.argv[2] || 'scroll-down';

    if (step === 'scroll-down') {
        await page.evaluate(() => {
            const divs = document.querySelectorAll('div');
            for (const d of divs) {
                if (d.scrollHeight > d.clientHeight + 100 && d.clientHeight > 300 && d.clientHeight < 600) {
                    d.scrollBy(0, 400);
                    return 'scrolled div h=' + d.clientHeight;
                }
            }
            window.scrollBy(0, 400);
            return 'window';
        });
        await sleep(800);
        await page.screenshot({ path: '/tmp/ads-scroll.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-scroll.jpg');
    }

    if (step === 'scroll-up') {
        await page.evaluate(() => {
            const divs = document.querySelectorAll('div');
            for (const d of divs) {
                if (d.scrollHeight > d.clientHeight + 100 && d.clientHeight > 300 && d.clientHeight < 600) {
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

    if (step === 'change-page-fb') {
        // Click on the Page Facebook dropdown to change from Armoni to PACIFIK'AI
        // First find the dropdown containing 'Armoni'
        const result = await page.evaluate(() => {
            const els = document.querySelectorAll('*');
            for (const el of els) {
                if (el.textContent?.trim()?.includes('Armoni Trading') && el.childNodes.length <= 3) {
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 100 && rect.height > 20 && rect.height < 60) {
                        el.click();
                        return 'clicked Armoni dropdown at y=' + Math.round(rect.y);
                    }
                }
            }
            return 'not found';
        });
        console.log(result);
        await sleep(1500);
        await page.screenshot({ path: '/tmp/ads-page-dd.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-page-dd.jpg');
    }

    if (step === 'select-pacifikai-page') {
        // Select PACIFIK'AI page from dropdown
        const result = await page.evaluate(() => {
            const els = document.querySelectorAll('*');
            for (const el of els) {
                const text = el.textContent?.trim();
                if (text && (text === "PACIFIK'AI" || text === 'PACIFIKAI') && el.childNodes.length <= 2) {
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        el.click();
                        return 'clicked PACIFIKAI page';
                    }
                }
            }
            return 'PACIFIKAI page not found';
        });
        console.log(result);
        await sleep(1500);
        await page.screenshot({ path: '/tmp/ads-page-sel.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-page-sel.jpg');
    }

    if (step === 'click-event-dd') {
        // Click the conversion event dropdown
        const result = await page.evaluate(() => {
            const els = document.querySelectorAll('*');
            for (const el of els) {
                const text = el.textContent?.trim();
                if (text?.includes('Sélectionnez un événement') || text?.includes('recherche par nom')) {
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 200) {
                        // Find clickable parent
                        let node = el;
                        for (let i = 0; i < 5; i++) {
                            node = node.parentElement;
                            if (!node) break;
                            const nr = node.getBoundingClientRect();
                            if (nr.width > 200 && (node.getAttribute('tabindex') || node.getAttribute('role'))) {
                                node.click();
                                return 'clicked parent at level ' + i;
                            }
                        }
                        el.click();
                        return 'clicked text at y=' + Math.round(rect.y);
                    }
                }
            }
            return 'not found';
        });
        console.log(result);
        await sleep(1500);
        await page.screenshot({ path: '/tmp/ads-event-dd.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-event-dd.jpg');
    }

    if (step === 'select-lead') {
        // Click 'Lead' in the dropdown list
        const result = await page.evaluate(() => {
            const els = document.querySelectorAll('*');
            for (const el of els) {
                if (el.childNodes.length === 1 && el.textContent?.trim() === 'Lead') {
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        let node = el;
                        for (let i = 0; i < 8; i++) {
                            node = node.parentElement;
                            if (!node) break;
                            if (node.getAttribute('role') === 'option' || node.getAttribute('role') === 'gridcell' || node.getAttribute('tabindex') === '0') {
                                node.click();
                                return 'clicked option at level ' + i;
                            }
                        }
                        el.click();
                        return 'clicked Lead text';
                    }
                }
            }
            return 'Lead not found';
        });
        console.log(result);
        await sleep(1500);
        await page.screenshot({ path: '/tmp/ads-lead.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-lead.jpg');
    }

    if (step === 'screenshot') {
        const path = process.argv[3] || '/tmp/ads-adset.jpg';
        await page.screenshot({ path, type: 'jpeg', quality: 70 });
        console.log('Screenshot:', path);
    }

    if (step === 'text') {
        const text = await page.evaluate(() => document.body?.innerText?.substring(0, 6000));
        console.log(text);
    }

    if (step === 'click-at') {
        const x = parseInt(process.argv[3]);
        const y = parseInt(process.argv[4]);
        await page.mouse.click(x, y);
        console.log('Clicked', x, y);
        await sleep(2000);
        await page.screenshot({ path: '/tmp/ads-click.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-click.jpg');
    }

    if (step === 'suivant') {
        await page.mouse.click(751, 537);
        console.log('Clicked Suivant');
        await sleep(4000);
        await page.screenshot({ path: '/tmp/ads-next.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-next.jpg');
    }
}

main().catch(e => console.error('ERROR:', e.message));
