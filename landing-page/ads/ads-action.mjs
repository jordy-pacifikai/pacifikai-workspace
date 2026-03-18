#!/usr/bin/env node
import puppeteer from 'puppeteer-core';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getPage() {
    const resp = await fetch('http://localhost:9222/json/version');
    const data = await resp.json();
    const browser = await puppeteer.connect({ browserWSEndpoint: data.webSocketDebuggerUrl });
    const pages = await browser.pages();
    let page = pages.find(p => p.url().includes('adsmanager'));
    if (!page) {
        // Try facebook.com/adsmanager too
        page = pages.find(p => p.url().includes('facebook.com/ads'));
    }
    if (!page) throw new Error('No AdsManager tab found');
    return page;
}

const step = process.argv[2] || 'screenshot';
const arg1 = process.argv[3];
const arg2 = process.argv[4];

const page = await getPage();

switch (step) {
    case 'screenshot': {
        const path = arg1 || '/tmp/ads-action.jpg';
        await page.screenshot({ path, type: 'jpeg', quality: 70 });
        console.log('Screenshot:', path);
        break;
    }

    case 'text': {
        const text = await page.evaluate(() => document.body?.innerText?.substring(0, 5000));
        console.log(text);
        break;
    }

    case 'click-event-dropdown': {
        // Click the conversion event dropdown
        const result = await page.evaluate(() => {
            const all = document.querySelectorAll('*');
            for (const el of all) {
                if (el.childNodes.length === 1 && el.textContent?.trim()?.includes('Sélectionnez un événement')) {
                    let node = el;
                    for (let i = 0; i < 8 && node; i++) {
                        if (node.getAttribute('role') === 'combobox' || node.getAttribute('aria-haspopup') || node.tagName === 'SELECT') {
                            node.click();
                            return 'clicked combobox at level ' + i;
                        }
                        node = node.parentElement;
                    }
                    // Click parent with tabindex
                    node = el;
                    for (let i = 0; i < 8 && node; i++) {
                        if (node.getAttribute('tabindex') !== null && node.getBoundingClientRect().width > 200) {
                            node.click();
                            return 'clicked tabindex at level ' + i;
                        }
                        node = node.parentElement;
                    }
                    el.click();
                    return 'clicked text directly';
                }
            }
            return 'not found';
        });
        console.log(result);
        await sleep(1500);
        await page.screenshot({ path: '/tmp/ads-event-dd.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-event-dd.jpg');
        break;
    }

    case 'select-lead': {
        // Select "Lead" from the event dropdown options
        const result = await page.evaluate(() => {
            const all = document.querySelectorAll('*');
            for (const el of all) {
                if (el.childNodes.length === 1 && el.textContent?.trim() === 'Lead') {
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        let node = el;
                        for (let i = 0; i < 5 && node; i++) {
                            if (node.getAttribute('role') === 'option' || node.getAttribute('role') === 'gridcell' || node.getAttribute('tabindex') === '0') {
                                node.click();
                                return 'clicked option at level ' + i;
                            }
                            node = node.parentElement;
                        }
                        el.click();
                        return 'clicked Lead text directly';
                    }
                }
            }
            return 'Lead not found';
        });
        console.log(result);
        await sleep(1500);
        await page.screenshot({ path: '/tmp/ads-lead.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-lead.jpg');
        break;
    }

    case 'scroll': {
        const dir = arg1 === 'up' ? -500 : 500;
        await page.evaluate((d) => {
            const els = document.querySelectorAll('div');
            for (const el of els) {
                if (el.scrollHeight > el.clientHeight + 50 && el.clientHeight > 300) {
                    el.scrollTop += d;
                    return;
                }
            }
            window.scrollBy(0, d);
        }, dir);
        await sleep(800);
        await page.screenshot({ path: '/tmp/ads-action.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-action.jpg');
        break;
    }

    case 'change-page': {
        // Click the Page Facebook dropdown and select PACIFIK'AI
        const result = await page.evaluate(() => {
            const all = document.querySelectorAll('*');
            for (const el of all) {
                if (el.textContent?.trim() === 'Armoni Trading AI' && el.childNodes.length <= 2) {
                    let node = el;
                    for (let i = 0; i < 5 && node; i++) {
                        if (node.getAttribute('role') === 'combobox' || node.tagName === 'SELECT' || node.getAttribute('aria-haspopup')) {
                            node.click();
                            return 'clicked combobox';
                        }
                        node = node.parentElement;
                    }
                    el.click();
                    return 'clicked text';
                }
            }
            return 'not found';
        });
        console.log(result);
        await sleep(1500);
        await page.screenshot({ path: '/tmp/ads-page-dd.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-page-dd.jpg');
        break;
    }

    case 'click-gridcell': {
        // Click a gridcell containing specific text
        const target = arg1;
        const result = await page.evaluate((t) => {
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
            while (walker.nextNode()) {
                if (walker.currentNode.textContent.trim() === t) {
                    let node = walker.currentNode.parentElement;
                    for (let i = 0; i < 10 && node; i++) {
                        if (node.getAttribute('role') === 'gridcell' || node.getAttribute('role') === 'option' ||
                            (node.getAttribute('tabindex') === '0' && node.getBoundingClientRect().width > 50)) {
                            node.click();
                            return 'clicked at level ' + i + ' role=' + node.getAttribute('role');
                        }
                        node = node.parentElement;
                    }
                    walker.currentNode.parentElement.click();
                    return 'clicked parent of text';
                }
            }
            return 'not found: ' + t;
        }, target);
        console.log(result);
        await sleep(2000);
        await page.screenshot({ path: '/tmp/ads-action.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-action.jpg');
        break;
    }

    case 'click-button': {
        const target = arg1;
        const els = await page.$$('div[role="button"], button, span[role="button"], a[role="button"]');
        let clicked = false;
        for (const el of els) {
            const text = await page.evaluate(e => e.innerText?.trim(), el);
            if (text === target) {
                const box = await el.boundingBox();
                if (box && box.width > 0) {
                    await el.click();
                    console.log('Clicked:', target);
                    clicked = true;
                    break;
                }
            }
        }
        if (!clicked) console.log('Not found:', target);
        await sleep(2000);
        await page.screenshot({ path: '/tmp/ads-action.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-action.jpg');
        break;
    }

    case 'type-in-focused': {
        const text = arg1;
        await page.keyboard.type(text, { delay: 30 });
        await sleep(500);
        await page.screenshot({ path: '/tmp/ads-action.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-action.jpg');
        break;
    }

    case 'list-dropdowns': {
        const result = await page.evaluate(() => {
            const items = [];
            document.querySelectorAll('[role="combobox"], select, [aria-haspopup]').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.width > 20) {
                    items.push({ text: el.innerText?.trim()?.substring(0, 50), tag: el.tagName, role: el.getAttribute('role'), y: Math.round(rect.y), w: Math.round(rect.width) });
                }
            });
            return items;
        });
        console.log(JSON.stringify(result, null, 2));
        break;
    }

    default:
        console.log('Commands: screenshot, text, click-event-dropdown, select-lead, scroll [up], change-page, click-gridcell "text", click-button "text", type-in-focused "text", list-dropdowns');
}
