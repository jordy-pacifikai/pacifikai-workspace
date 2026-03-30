const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

puppeteerExtra.use(StealthPlugin());

const OUTPUT = '/Users/jordybanks/Documents/PACIFIKAI/Argentic Workflows/PACIFIK\'AI/solutions/bookflow/scripts/screencast-output';
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('🎥 Messenger Screencast (headless stealth)');

  const browser = await puppeteerExtra.launch({
    headless: 'shell',
    args: ['--window-size=1920,1080', '--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Login Facebook
  console.log('Logging into Facebook...');
  await page.goto('https://www.facebook.com/login', { waitUntil: 'networkidle2', timeout: 15000 });
  await sleep(2000);

  const emailInput = await page.waitForSelector('input[name="email"], #email', { timeout: 10000 }).catch(() => null);
  if (!emailInput) {
    console.log('❌ No email input');
    await page.screenshot({ path: path.join(OUTPUT, 'fb-blocked.png') });
    const body = await page.evaluate(() => document.body.innerText.substring(0, 200));
    console.log('Body:', body);
    await browser.close();
    process.exit(1);
  }

  await emailInput.type('jordybanks@mail.com', { delay: 50 });
  const passInput = await page.waitForSelector('input[name="pass"], #pass', { timeout: 5000 });
  await passInput.type('Sennosen2258#', { delay: 50 });

  const loginBtn = await page.$('button[name="login"], #loginbutton');
  if (loginBtn) await loginBtn.click();
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {});
  await sleep(3000);

  console.log('URL:', page.url());

  if (page.url().includes('checkpoint') || page.url().includes('two_step')) {
    console.log('⚠️ 2FA checkpoint');
    await page.screenshot({ path: path.join(OUTPUT, 'fb-2fa.png') });
    await browser.close();
    process.exit(1);
  }

  if (page.url().includes('login')) {
    console.log('❌ Login failed');
    await page.screenshot({ path: path.join(OUTPUT, 'fb-fail.png') });
    await browser.close();
    process.exit(1);
  }

  console.log('✅ Logged in!');

  // Go to Messenger
  console.log('\n💬 Opening Messenger...');
  await page.goto('https://www.messenger.com/t/466150073258705', { waitUntil: 'networkidle2', timeout: 20000 });
  await sleep(5000);
  console.log('Messenger:', page.url());
  await page.screenshot({ path: path.join(OUTPUT, 'messenger-01-before.png') });

  // Type and send message
  const msgInput = await page.$('[role="textbox"], [contenteditable="true"]');
  if (msgInput) {
    const recorder = await page.screencast({ path: path.join(OUTPUT, 'messenger-live.webm') });
    
    await msgInput.click();
    await sleep(500);
    await page.keyboard.type('Bonjour, je voudrais prendre rendez-vous pour demain 14h svp', { delay: 40 });
    await sleep(1000);
    await page.keyboard.press('Enter');
    console.log('✅ Message sent');

    console.log('Waiting 20s for bot...');
    await sleep(20000);
    
    await recorder.stop();
    await page.screenshot({ path: path.join(OUTPUT, 'messenger-02-after.png') });
    console.log('✅ Recorded');

    // Convert
    const webm = path.join(OUTPUT, 'messenger-live.webm');
    const mp4 = path.join(OUTPUT, 'messenger-live.mp4');
    if (fs.existsSync(webm)) {
      execSync(`ffmpeg -y -i "${webm}" -c:v libx264 -crf 20 "${mp4}"`, { stdio: 'pipe' });
      console.log('✅ messenger-live.mp4');
    }
  } else {
    console.log('⚠️ No input found');
    await page.screenshot({ path: path.join(OUTPUT, 'messenger-no-input.png') });
  }

  await browser.close();
  console.log('\n✅ Done!');
})().catch(e => { console.error('❌', e.message); process.exit(1); });
