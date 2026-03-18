#!/usr/bin/env node
import puppeteer from 'puppeteer-core';
import path from 'path';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
    const resp = await fetch('http://localhost:9222/json/version');
    const data = await resp.json();
    const browser = await puppeteer.connect({ browserWSEndpoint: data.webSocketDebuggerUrl });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes('adsmanager') || p.url().includes('facebook.com/ads'));
    if (!page) { console.log('No AdsManager tab'); return; }

    const step = process.argv[2] || 'click-import';

    if (step === 'click-import') {
        // Click the "+ Importer" button
        const result = await page.evaluate(() => {
            const btns = document.querySelectorAll('div[role="button"], button, a, span');
            for (const btn of btns) {
                const text = btn.innerText?.trim();
                if (text && text.includes('Importer') && !text.includes('Contenu')) {
                    btn.click();
                    return 'clicked: ' + text + ' tag=' + btn.tagName;
                }
            }
            return 'not found';
        });
        console.log(result);
        await sleep(2000);
        await page.screenshot({ path: '/tmp/ads-import.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-import.jpg');
    }

    if (step === 'upload-file') {
        // Find the hidden file input and upload our creative
        const filePath = process.argv[3] || path.resolve('output/creative-1-before-after-feed.png');

        // Wait for file input to appear or create one
        const fileInputs = await page.$$('input[type="file"]');
        console.log('Found', fileInputs.length, 'file inputs');

        if (fileInputs.length > 0) {
            // Use the last file input (usually the active one)
            const fileInput = fileInputs[fileInputs.length - 1];
            await fileInput.uploadFile(filePath);
            console.log('Uploaded:', filePath);
        } else {
            console.log('No file input found - trying to click import button first');
            // Click the import button to trigger file dialog
            const clicked = await page.evaluate(() => {
                const btns = document.querySelectorAll('div[role="button"], button, a, span');
                for (const btn of btns) {
                    const text = btn.innerText?.trim();
                    if (text && text.includes('Importer')) {
                        return { text, tag: btn.tagName, x: Math.round(btn.getBoundingClientRect().x), y: Math.round(btn.getBoundingClientRect().y) };
                    }
                }
                return null;
            });
            console.log('Import button:', JSON.stringify(clicked));
        }

        await sleep(5000);
        await page.screenshot({ path: '/tmp/ads-uploaded.jpg', type: 'jpeg', quality: 70 });
        console.log('Screenshot: /tmp/ads-uploaded.jpg');
    }

    if (step === 'find-inputs') {
        // List all file inputs on the page
        const inputs = await page.evaluate(() => {
            const results = [];
            document.querySelectorAll('input[type="file"]').forEach((el, i) => {
                results.push({
                    index: i,
                    accept: el.accept,
                    multiple: el.multiple,
                    name: el.name,
                    hidden: el.hidden || el.style.display === 'none' || el.offsetParent === null,
                });
            });
            return results;
        });
        console.log('File inputs:', JSON.stringify(inputs, null, 2));
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
        console.log('Clicked', x, y, '- Screenshot: /tmp/ads-click.jpg');
    }
}

main().catch(e => console.error('ERROR:', e.message));
