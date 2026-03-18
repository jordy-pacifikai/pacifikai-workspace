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

    const step = process.argv[2] || 'fill-url';

    if (step === 'fill-url') {
        const url = 'https://pacifikai.com/offre-site-web?utm_source=facebook&utm_medium=paid&utm_campaign=site-web-100k';
        const result = await page.evaluate((u) => {
            const inputs = document.querySelectorAll('input');
            for (const inp of inputs) {
                if (inp.placeholder?.includes('example') || inp.placeholder?.includes('http') || inp.placeholder?.includes('URL')) {
                    const rect = inp.getBoundingClientRect();
                    if (rect.width > 100) {
                        inp.focus();
                        inp.select();
                        document.execCommand('insertText', false, u);
                        inp.dispatchEvent(new Event('input', { bubbles: true }));
                        inp.dispatchEvent(new Event('change', { bubbles: true }));
                        return 'filled URL: ' + inp.value.substring(0, 60);
                    }
                }
            }
            return 'URL input not found';
        }, url);
        console.log(result);
        await sleep(1500);
        await page.screenshot({ path: '/tmp/ads-url.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-url.jpg');
    }

    if (step === 'scroll-down') {
        await page.evaluate(() => {
            const divs = document.querySelectorAll('div');
            for (const d of divs) {
                if (d.scrollHeight > d.clientHeight + 100 && d.clientHeight > 300 && d.clientHeight < 600) {
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

    if (step === 'fill-text') {
        // Fill the primary text (texte principal)
        const text = process.argv[3] || 'Site internet clé en main à 100 000 F. 5 pages, design premium, optimisé mobile. Offre limitée à 50 places.\n\n🌴 Conçu pour les entreprises de Polynésie française.\n\n👉 Réservez votre place maintenant';
        const result = await page.evaluate((t) => {
            const textareas = document.querySelectorAll('textarea, [contenteditable="true"], div[role="textbox"]');
            for (const ta of textareas) {
                const rect = ta.getBoundingClientRect();
                if (rect.width > 200 && rect.height > 30) {
                    ta.focus();
                    if (ta.tagName === 'TEXTAREA') {
                        ta.select();
                        document.execCommand('insertText', false, t);
                    } else {
                        ta.textContent = t;
                        ta.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    return 'filled text in ' + ta.tagName;
                }
            }
            return 'textarea not found';
        }, text);
        console.log(result);
        await sleep(1000);
        await page.screenshot({ path: '/tmp/ads-text.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-text.jpg');
    }

    if (step === 'fill-headline') {
        // Fill headline field
        const headline = process.argv[3] || 'Site Web Pro à 100 000 F — Livré en 5 Jours';
        const result = await page.evaluate((h) => {
            const inputs = document.querySelectorAll('input, textarea, div[role="textbox"]');
            const filled = [];
            for (const inp of inputs) {
                const rect = inp.getBoundingClientRect();
                const placeholder = inp.placeholder || inp.getAttribute('aria-label') || '';
                if (placeholder.toLowerCase().includes('titre') || placeholder.toLowerCase().includes('headline')) {
                    inp.focus();
                    if (inp.tagName === 'INPUT' || inp.tagName === 'TEXTAREA') {
                        inp.select();
                        document.execCommand('insertText', false, h);
                    }
                    filled.push(placeholder);
                }
            }
            return filled.length > 0 ? 'filled: ' + filled.join(', ') : 'headline input not found';
        }, headline);
        console.log(result);
        await sleep(1000);
        await page.screenshot({ path: '/tmp/ads-headline.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-headline.jpg');
    }

    if (step === 'upload-image') {
        // Click "Ajouter des fichiers multimédias" button
        const result = await page.evaluate(() => {
            const btns = document.querySelectorAll('div[role="button"], button, a');
            for (const btn of btns) {
                const text = btn.innerText?.trim();
                if (text?.includes('Ajouter') && (text.includes('média') || text.includes('image') || text.includes('fichier'))) {
                    btn.click();
                    return 'clicked: ' + text;
                }
            }
            return 'upload button not found';
        });
        console.log(result);
        await sleep(2000);
        await page.screenshot({ path: '/tmp/ads-upload.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-upload.jpg');
    }

    if (step === 'screenshot') {
        const path = process.argv[3] || '/tmp/ads-ad.jpg';
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
        console.log('Screenshot: /tmp/ads-click.jpg');
    }
}

main().catch(e => console.error('ERROR:', e.message));
