#!/usr/bin/env node
import puppeteer from 'puppeteer-core';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
    const resp = await fetch('http://localhost:9222/json/version');
    const data = await resp.json();
    const browser = await puppeteer.connect({ browserWSEndpoint: data.webSocketDebuggerUrl });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes('adsmanager') || p.url().includes('facebook.com/ads'));
    if (!page) { console.log('No AdsManager tab'); return; }

    const step = process.argv[2] || 'click-image';

    if (step === 'click-image') {
        const result = await page.evaluate(() => {
            const all = document.querySelectorAll('div, span, li, a');
            for (const el of all) {
                if (el.childNodes.length <= 3) {
                    const text = el.innerText?.trim();
                    if (text === 'Publicité image') {
                        el.click();
                        return 'clicked: ' + el.tagName + ' - ' + text;
                    }
                }
            }
            return 'not found';
        });
        console.log(result);
        await sleep(3000);
        await page.screenshot({ path: '/tmp/ads-image-selected.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-image-selected.jpg');
    }

    if (step === 'upload-media') {
        // Click "Ajouter des fichiers multimédias" or similar upload button
        const result = await page.evaluate(() => {
            const btns = document.querySelectorAll('div[role="button"], button, a, span');
            for (const btn of btns) {
                const text = btn.innerText?.trim();
                if (text && (text.includes('Ajouter') || text.includes('Importer')) &&
                    (text.includes('média') || text.includes('image') || text.includes('fichier'))) {
                    btn.click();
                    return 'clicked: ' + text;
                }
            }
            return 'upload button not found';
        });
        console.log(result);
        await sleep(3000);
        await page.screenshot({ path: '/tmp/ads-upload.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-upload.jpg');
    }

    if (step === 'fill-primary-text') {
        const text = process.argv[3] || 'Site internet clé en main à 100 000 F. 5 pages, design premium, optimisé mobile. Offre limitée à 50 places.\n\n🌴 Conçu pour les entreprises de Polynésie française.\n\n👉 Réservez votre place maintenant';
        const result = await page.evaluate((t) => {
            // Try textareas and contenteditable divs
            const candidates = document.querySelectorAll('textarea, div[contenteditable="true"], div[role="textbox"], [data-lexical-editor]');
            for (const el of candidates) {
                const rect = el.getBoundingClientRect();
                if (rect.width > 200 && rect.height > 30 && rect.y > 100) {
                    el.focus();
                    if (el.tagName === 'TEXTAREA') {
                        el.select();
                        document.execCommand('insertText', false, t);
                    } else {
                        // contenteditable
                        const sel = window.getSelection();
                        sel.selectAllChildren(el);
                        document.execCommand('insertText', false, t);
                    }
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    return 'filled text in ' + el.tagName + ' at y=' + Math.round(rect.y);
                }
            }
            return 'text field not found';
        }, text);
        console.log(result);
        await sleep(1500);
        await page.screenshot({ path: '/tmp/ads-text.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-text.jpg');
    }

    if (step === 'fill-headline') {
        const headline = process.argv[3] || 'Site Web Pro à 100 000 F — Livré en 5 Jours';
        const result = await page.evaluate((h) => {
            const inputs = document.querySelectorAll('input, textarea, div[role="textbox"]');
            for (const inp of inputs) {
                const rect = inp.getBoundingClientRect();
                const ph = inp.placeholder || inp.getAttribute('aria-label') || '';
                if (ph.toLowerCase().includes('titre') || ph.toLowerCase().includes('headline')) {
                    inp.focus();
                    if (inp.tagName === 'INPUT' || inp.tagName === 'TEXTAREA') {
                        inp.select();
                        document.execCommand('insertText', false, h);
                    }
                    return 'filled headline: ' + ph;
                }
            }
            return 'headline not found';
        }, headline);
        console.log(result);
        await sleep(1000);
        await page.screenshot({ path: '/tmp/ads-headline.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-headline.jpg');
    }

    if (step === 'screenshot') {
        const path = process.argv[3] || '/tmp/ads-state.jpg';
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
        await sleep(2000);
        await page.screenshot({ path: '/tmp/ads-click.jpg', type: 'jpeg', quality: 70 });
        console.log('Clicked', x, y, '- Screenshot: /tmp/ads-click.jpg');
    }

    if (step === 'list-fields') {
        const fields = await page.evaluate(() => {
            const results = [];
            document.querySelectorAll('input, textarea, div[contenteditable="true"], div[role="textbox"], [data-lexical-editor]').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.width < 10 || rect.height < 5) return;
                results.push({
                    tag: el.tagName,
                    type: el.type || '',
                    value: (el.value || el.textContent || '').substring(0, 80),
                    placeholder: (el.placeholder || el.getAttribute('aria-label') || '').substring(0, 60),
                    contenteditable: el.contentEditable,
                    x: Math.round(rect.x), y: Math.round(rect.y),
                    w: Math.round(rect.width), h: Math.round(rect.height),
                });
            });
            return results;
        });
        console.log(JSON.stringify(fields, null, 2));
    }

    if (step === 'scroll-down') {
        await page.evaluate(() => {
            const containers = document.querySelectorAll('div');
            for (const d of containers) {
                if (d.scrollHeight > d.clientHeight + 100 && d.clientHeight > 300 && d.clientHeight < 700) {
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
                if (d.scrollHeight > d.clientHeight + 100 && d.clientHeight > 300 && d.clientHeight < 700) {
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
