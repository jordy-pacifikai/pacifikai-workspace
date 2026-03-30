const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteerExtra.use(StealthPlugin());
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const OUTPUT = process.env.OUTPUT;
const REF = process.env.REF;
const SERVICE_KEY = process.env.SERVICE_KEY;
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('🎥 Facebook OAuth Flow Recording');
  
  const browser = await puppeteerExtra.launch({
    headless: 'shell',
    args: ['--no-sandbox', '--window-size=1920,1080'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // === Step 1: Login to Facebook ===
  console.log('Step 1: Facebook login...');
  await page.goto('https://www.facebook.com/', { waitUntil: 'networkidle2', timeout: 15000 });
  await sleep(3000);
  await page.evaluate(() => { [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Allow all cookies')?.click(); });
  await sleep(2000);
  await page.type('input[name="email"]', 'jordybanks@mail.com', { delay: 20 });
  await page.type('input[name="pass"]', 'Sennosen2258#', { delay: 20 });
  await page.keyboard.press('Enter');
  await sleep(10000);
  
  if (page.url().includes('login') || page.url().includes('checkpoint')) {
    console.log('❌ FB login failed:', page.url());
    await page.screenshot({ path: path.join(OUTPUT, 'oauth-fb-fail.png') });
    await browser.close();
    process.exit(1);
  }
  console.log('✅ Facebook logged in');

  // === Step 2: Login to Ve'a Dashboard ===
  console.log('Step 2: Ve\'a dashboard login...');
  await page.goto('https://dashboard.vea.pacifikai.com/login', { waitUntil: 'networkidle2' });
  await sleep(2000);
  
  const emailInput = await page.waitForSelector('input[type="email"]');
  await emailInput.type('jordy@highvaluecapital.club', { delay: 30 });
  const submitBtn = await page.$('button[type="submit"]');
  await submitBtn.click();
  await sleep(3000);

  // Generate OTP
  const otpRes = await fetch(`https://${REF}.supabase.co/auth/v1/admin/generate_link`, {
    method: 'POST',
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'jordy@highvaluecapital.club', type: 'magiclink' }),
  });
  const { email_otp: otp } = await otpRes.json();
  console.log('OTP:', otp);

  const otpInputs = await page.$$('input[maxlength="1"]');
  for (let i = 0; i < 6; i++) {
    await otpInputs[i].click();
    await otpInputs[i].type(otp[i], { delay: 80 });
  }
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await sleep(3000);
  console.log('✅ Dashboard logged in:', page.url());

  // === Step 3: Go to Channels and record OAuth flow ===
  console.log('Step 3: Recording OAuth flow...');
  
  const rec = await page.screencast({ path: path.join(OUTPUT, 'oauth-flow.webm') });
  
  await page.goto('https://dashboard.vea.pacifikai.com/channels', { waitUntil: 'networkidle2' });
  await sleep(4000);
  await page.screenshot({ path: path.join(OUTPUT, 'oauth-01-disconnected.png') });
  console.log('📸 Channels disconnected state');

  // Listen for popup (Facebook OAuth)
  const popupPromise = new Promise(resolve => {
    browser.on('targetcreated', async target => {
      if (target.type() === 'page') {
        const popup = await target.page();
        if (popup && popup.url().includes('facebook.com')) {
          resolve(popup);
        }
      }
    });
  });

  // Click "Connecter Facebook" button
  const connectBtn = await page.evaluate(() => {
    const btns = document.querySelectorAll('button, a, [role="button"]');
    for (const b of btns) {
      const text = b.textContent.trim().toLowerCase();
      if (text.includes('connecter') && text.includes('facebook')) {
        b.click();
        return b.textContent.trim();
      }
    }
    // Try just "Connecter"
    for (const b of btns) {
      if (b.textContent.trim() === 'Connecter') {
        b.click();
        return 'Connecter';
      }
    }
    return 'not found';
  });
  console.log('Connect button:', connectBtn);

  // Wait for the OAuth popup
  let popup;
  try {
    popup = await Promise.race([
      popupPromise,
      sleep(10000).then(() => null),
    ]);
  } catch {}

  if (popup) {
    console.log('✅ OAuth popup opened:', popup.url().substring(0, 80));
    await sleep(3000);
    await popup.screenshot({ path: path.join(OUTPUT, 'oauth-02-fb-popup.png') });
    console.log('📸 Facebook OAuth popup');
    
    // The popup should show permissions or Page selection
    // If already logged in, it might auto-redirect or show "Continue"
    const popupBody = await popup.evaluate(() => document.body.innerText.substring(0, 300)).catch(() => '');
    console.log('Popup content:', popupBody.substring(0, 200));
    
    // Try to click Continue/Authorize if visible
    await popup.evaluate(() => {
      const btns = document.querySelectorAll('button, [role="button"], input[type="submit"]');
      for (const b of btns) {
        const text = (b.textContent || b.value || '').trim();
        if (text.includes('Continue') || text.includes('Continuer') || text.includes('Allow') || text.includes('Autoriser')) {
          b.click();
          return;
        }
      }
    }).catch(() => {});
    
    await sleep(5000);
    
    // Check if there's Page selection
    try {
      await popup.screenshot({ path: path.join(OUTPUT, 'oauth-03-page-select.png') });
      console.log('📸 After authorize click');
    } catch {}
    
    // Wait for popup to close (redirect back to dashboard)
    await sleep(10000);
  } else {
    console.log('⚠️ No popup detected');
    await page.screenshot({ path: path.join(OUTPUT, 'oauth-02-no-popup.png') });
  }

  // Check final dashboard state
  await sleep(5000);
  await page.goto('https://dashboard.vea.pacifikai.com/channels', { waitUntil: 'networkidle2' });
  await sleep(4000);
  await page.screenshot({ path: path.join(OUTPUT, 'oauth-04-after.png') });
  console.log('📸 Channels after OAuth');

  await rec.stop();
  console.log('Recording stopped');

  // Convert
  try {
    execSync(`ffmpeg -y -i "${path.join(OUTPUT, 'oauth-flow.webm')}" -c:v libx264 -crf 20 -preset fast "${path.join(OUTPUT, 'oauth-flow.mp4')}"`, { stdio: 'pipe' });
    const sz = fs.statSync(path.join(OUTPUT, 'oauth-flow.mp4')).size;
    console.log(`✅ oauth-flow.mp4 (${(sz/1024/1024).toFixed(1)}MB)`);
  } catch {}

  await browser.close();
  console.log('Done');
})().catch(e => { console.error('❌', e.message); process.exit(1); });
