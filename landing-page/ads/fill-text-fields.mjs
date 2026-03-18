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

    const step = process.argv[2] || 'fill-all';

    if (step === 'fill-all') {
        // 1. Fill "Texte principal" (contenteditable div)
        const primaryText = `Site internet clé en main à 100 000 F. 5 pages, design premium, optimisé mobile. Offre limitée à 50 places.

🌴 Conçu pour les entreprises de Polynésie française.

👉 Réservez votre place maintenant`;

        const r1 = await page.evaluate((text) => {
            const div = document.querySelector('div[contenteditable="true"][aria-placeholder*="Décrivez"]');
            if (!div) {
                // Fallback: find by placeholder text in data attributes or nearby
                const allCE = document.querySelectorAll('div[contenteditable="true"]');
                for (const ce of allCE) {
                    const ph = ce.getAttribute('aria-placeholder') || ce.dataset.placeholder || '';
                    const rect = ce.getBoundingClientRect();
                    if (rect.y > 100 && rect.y < 250 && rect.width > 400) {
                        ce.focus();
                        const sel = window.getSelection();
                        sel.selectAllChildren(ce);
                        document.execCommand('insertText', false, text);
                        ce.dispatchEvent(new Event('input', { bubbles: true }));
                        return 'filled primary text (fallback) at y=' + Math.round(rect.y);
                    }
                }
                return 'primary text field not found';
            }
            div.focus();
            const sel = window.getSelection();
            sel.selectAllChildren(div);
            document.execCommand('insertText', false, text);
            div.dispatchEvent(new Event('input', { bubbles: true }));
            return 'filled primary text';
        }, primaryText);
        console.log('Primary text:', r1);
        await sleep(1000);

        // 2. Fill "Titre" (input text)
        const headline = 'Site Web Pro à 100 000 F — Livré en 5 Jours';
        const r2 = await page.evaluate((h) => {
            const inp = document.querySelector('input[placeholder*="court titre"]');
            if (!inp) {
                const inputs = document.querySelectorAll('input[type="text"]');
                for (const i of inputs) {
                    if (i.placeholder?.includes('titre') || i.placeholder?.includes('Écrivez')) {
                        i.focus();
                        i.select();
                        document.execCommand('insertText', false, h);
                        return 'filled title (fallback): ' + i.value;
                    }
                }
                return 'title input not found';
            }
            inp.focus();
            inp.select();
            document.execCommand('insertText', false, h);
            inp.dispatchEvent(new Event('input', { bubbles: true }));
            inp.dispatchEvent(new Event('change', { bubbles: true }));
            return 'filled title: ' + inp.value;
        }, headline);
        console.log('Title:', r2);
        await sleep(1000);

        // 3. Fill "Description" (textarea)
        const description = 'Design premium • Optimisé mobile • Livraison 5 jours • Hébergement inclus 1 an';
        const r3 = await page.evaluate((d) => {
            const textareas = document.querySelectorAll('textarea');
            for (const ta of textareas) {
                const rect = ta.getBoundingClientRect();
                if (rect.y > 350 && rect.width > 400) {
                    ta.focus();
                    ta.select();
                    document.execCommand('insertText', false, d);
                    ta.dispatchEvent(new Event('input', { bubbles: true }));
                    ta.dispatchEvent(new Event('change', { bubbles: true }));
                    return 'filled description: ' + ta.value.substring(0, 50);
                }
            }
            return 'description textarea not found';
        }, description);
        console.log('Description:', r3);
        await sleep(1000);

        await page.screenshot({ path: '/tmp/ads-text-filled.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-text-filled.jpg');
    }

    if (step === 'screenshot') {
        const path = process.argv[3] || '/tmp/ads-state.jpg';
        await page.screenshot({ path, type: 'jpeg', quality: 70 });
        console.log('Screenshot:', path);
    }

    if (step === 'click-at') {
        const x = parseInt(process.argv[3]);
        const y = parseInt(process.argv[4]);
        await page.mouse.click(x, y);
        await sleep(2000);
        await page.screenshot({ path: '/tmp/ads-click.jpg', type: 'jpeg', quality: 70 });
        console.log('Clicked', x, y, '- Screenshot: /tmp/ads-click.jpg');
    }

    if (step === 'scroll-down') {
        await page.evaluate(() => {
            const containers = document.querySelectorAll('div');
            for (const d of containers) {
                if (d.scrollHeight > d.clientHeight + 50 && d.clientHeight > 300 && d.clientHeight < 600) {
                    d.scrollBy(0, 300);
                    return;
                }
            }
        });
        await sleep(800);
        await page.screenshot({ path: '/tmp/ads-scroll.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-scroll.jpg');
    }

    if (step === 'text') {
        const text = await page.evaluate(() => document.body?.innerText?.substring(0, 5000));
        console.log(text);
    }
}

main().catch(e => console.error('ERROR:', e.message));
