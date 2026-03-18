#!/usr/bin/env node
import puppeteer from 'puppeteer-core';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getPage() {
    const resp = await fetch('http://localhost:9222/json/version');
    const data = await resp.json();
    const browser = await puppeteer.connect({ browserWSEndpoint: data.webSocketDebuggerUrl });
    const pages = await browser.pages();
    return pages.find(p => p.url().includes('adsmanager'));
}

async function clickText(page, text) {
    const els = await page.$$('button, [role="button"], a, [role="link"], div[tabindex="0"], span[tabindex="0"]');
    for (const el of els) {
        const t = await page.evaluate(e => e.innerText?.trim(), el);
        if (t === text) { await el.click(); return true; }
    }
    return false;
}

async function screenshot(page, path = '/tmp/ads-config.jpg') {
    await page.screenshot({ path, type: 'jpeg', quality: 70 });
    console.log('Screenshot:', path);
}

async function main() {
    const page = await getPage();
    if (!page) { console.log('No AdsManager tab'); return; }

    const step = process.argv[2] || 'rename';

    switch (step) {
        case 'rename': {
            // Click on the campaign name input and replace it
            const input = await page.$('input[value="Nouvelle campagne de Prospects"]');
            if (input) {
                await input.click({ clickCount: 3 }); // select all
                await input.type('PACIFIKAI - Site Web 100K - Prospects');
                console.log('Campaign renamed');
            } else {
                // Try finding any input with that value
                const renamed = await page.evaluate(() => {
                    const inputs = document.querySelectorAll('input[type="text"], input:not([type])');
                    for (const inp of inputs) {
                        if (inp.value.includes('Nouvelle campagne')) {
                            inp.focus();
                            inp.select();
                            document.execCommand('insertText', false, 'PACIFIKAI - Site Web 100K - Prospects');
                            inp.dispatchEvent(new Event('input', { bubbles: true }));
                            inp.dispatchEvent(new Event('change', { bubbles: true }));
                            return inp.value;
                        }
                    }
                    return 'not found';
                });
                console.log('Rename result:', renamed);
            }
            await sleep(1000);
            await screenshot(page);
            break;
        }

        case 'scroll-budget': {
            // Scroll down to see budget section fully
            await page.evaluate(() => {
                const main = document.querySelector('[role="main"]') || document.querySelector('.xb57i2i') || document.documentElement;
                // Try scrolling various containers
                const containers = document.querySelectorAll('div[style*="overflow"], div[class*="scroll"]');
                let scrolled = false;
                for (const c of containers) {
                    if (c.scrollHeight > c.clientHeight && c.clientHeight > 200) {
                        c.scrollTop += 400;
                        scrolled = true;
                        break;
                    }
                }
                if (!scrolled) window.scrollBy(0, 400);
            });
            await sleep(1000);
            await screenshot(page);
            break;
        }

        case 'suivant': {
            await clickText(page, 'Suivant');
            console.log('Clicked Suivant');
            await sleep(3000);
            await screenshot(page);
            break;
        }

        case 'text': {
            const text = await page.evaluate(() => document.body?.innerText?.substring(0, 4000));
            console.log(text);
            break;
        }

        case 'screenshot': {
            const path = process.argv[3] || '/tmp/ads-config.jpg';
            await screenshot(page, path);
            break;
        }

        case 'click': {
            const target = process.argv[3];
            const clicked = await clickText(page, target);
            console.log(`Clicked "${target}":`, clicked);
            await sleep(2000);
            await screenshot(page);
            break;
        }

        case 'fill-input': {
            // Fill an input by its current value or nearby label
            const label = process.argv[3];
            const value = process.argv[4];
            const result = await page.evaluate((lbl, val) => {
                const inputs = document.querySelectorAll('input');
                for (const inp of inputs) {
                    const rect = inp.getBoundingClientRect();
                    if (rect.width < 20) continue;
                    // Check if input has matching placeholder or value
                    if (inp.placeholder?.includes(lbl) || inp.value?.includes(lbl) || inp.getAttribute('aria-label')?.includes(lbl)) {
                        inp.focus();
                        inp.select();
                        document.execCommand('insertText', false, val);
                        inp.dispatchEvent(new Event('input', { bubbles: true }));
                        inp.dispatchEvent(new Event('change', { bubbles: true }));
                        return 'filled: ' + inp.value;
                    }
                }
                // Also check by walking up from label text
                const labels = document.querySelectorAll('label, span, div');
                for (const el of labels) {
                    if (el.innerText?.trim() === lbl) {
                        const parent = el.closest('[class]');
                        if (parent) {
                            const inp = parent.querySelector('input');
                            if (inp) {
                                inp.focus();
                                inp.select();
                                document.execCommand('insertText', false, val);
                                inp.dispatchEvent(new Event('input', { bubbles: true }));
                                return 'filled via label: ' + inp.value;
                            }
                        }
                    }
                }
                return 'not found';
            }, label, value);
            console.log(result);
            await sleep(1000);
            await screenshot(page);
            break;
        }

        case 'eval': {
            const expr = process.argv[3];
            const result = await page.evaluate(expr);
            console.log(JSON.stringify(result, null, 2));
            break;
        }

        case 'list-inputs': {
            const inputs = await page.evaluate(() => {
                const results = [];
                document.querySelectorAll('input, select, textarea').forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.width < 10 || rect.height < 10) return;
                    results.push({
                        tag: el.tagName,
                        type: el.type,
                        value: el.value?.substring(0, 50),
                        placeholder: el.placeholder?.substring(0, 50),
                        'aria-label': el.getAttribute('aria-label')?.substring(0, 50),
                        name: el.name,
                        y: Math.round(rect.y),
                        w: Math.round(rect.width),
                    });
                });
                return results;
            });
            console.log(JSON.stringify(inputs, null, 2));
            break;
        }

        default:
            console.log('Commands: rename, scroll-budget, suivant, text, screenshot, click "text", fill-input "label" "value", eval "js", list-inputs');
    }
}

main().catch(e => console.error('ERROR:', e.message));
