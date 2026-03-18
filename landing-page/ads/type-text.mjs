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

    const step = process.argv[2] || 'fill-primary';

    if (step === 'fill-primary') {
        // Click in the primary text field and type
        const primaryText = `Site internet clé en main à 100 000 F. 5 pages, design premium, optimisé mobile. Offre limitée à 50 places.\n\n🌴 Conçu pour les entreprises de Polynésie française.\n\n👉 Réservez votre place maintenant`;

        // Find and fill the contenteditable div with placeholder "Décrivez"
        const r = await page.evaluate((text) => {
            const allCE = document.querySelectorAll('div[contenteditable="true"]');
            for (const ce of allCE) {
                const rect = ce.getBoundingClientRect();
                const ph = ce.getAttribute('aria-placeholder') || '';
                if (rect.width > 200 && rect.y > 100 && rect.y < 300 && (ph.includes('Décrivez') || ph.includes('objet'))) {
                    ce.focus();
                    // Clear existing content
                    ce.textContent = '';
                    // Use execCommand for React compatibility
                    document.execCommand('insertText', false, text);
                    ce.dispatchEvent(new Event('input', { bubbles: true }));
                    ce.dispatchEvent(new Event('change', { bubbles: true }));
                    return { filled: true, y: Math.round(rect.y), ph };
                }
            }
            // Fallback: any contenteditable visible
            for (const ce of allCE) {
                const rect = ce.getBoundingClientRect();
                if (rect.width > 200 && rect.y > 50 && rect.y < 400) {
                    ce.focus();
                    ce.textContent = '';
                    document.execCommand('insertText', false, text);
                    ce.dispatchEvent(new Event('input', { bubbles: true }));
                    return { filled: true, y: Math.round(rect.y), fallback: true };
                }
            }
            return { filled: false, count: allCE.length };
        }, primaryText);
        console.log('Primary text:', JSON.stringify(r));
        await sleep(1500);
        await page.screenshot({ path: '/tmp/ads-primary.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-primary.jpg');
    }

    if (step === 'click-and-type') {
        // Click at coordinates then use keyboard.type for React-safe input
        const x = parseInt(process.argv[3]);
        const y = parseInt(process.argv[4]);
        const text = process.argv[5] || '';

        await page.mouse.click(x, y);
        await sleep(500);

        // Select all existing text
        await page.keyboard.down('Meta');
        await page.keyboard.press('a');
        await page.keyboard.up('Meta');
        await sleep(200);

        // Type the new text
        await page.keyboard.type(text, { delay: 10 });
        console.log('Typed', text.length, 'chars at', x, y);
        await sleep(1000);
        await page.screenshot({ path: '/tmp/ads-typed.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-typed.jpg');
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

    if (step === 'scroll-down') {
        await page.evaluate(() => {
            const containers = document.querySelectorAll('div');
            for (const d of containers) {
                if (d.scrollHeight > d.clientHeight + 50 && d.clientHeight > 200 && d.clientHeight < 600) {
                    d.scrollBy(0, 300);
                    return 'scrolled container';
                }
            }
            window.scrollBy(0, 300);
            return 'scrolled window';
        });
        await sleep(800);
        await page.screenshot({ path: '/tmp/ads-scroll.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-scroll.jpg');
    }
}

main().catch(e => console.error('ERROR:', e.message));
