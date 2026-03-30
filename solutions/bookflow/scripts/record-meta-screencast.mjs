#!/usr/bin/env node
/**
 * Meta App Review Screencast — Full Automation
 * 1. Send OTP to jordy@pacifikai.com via Supabase
 * 2. Fetch OTP code from email via IMAP
 * 3. Verify OTP to get session
 * 4. Record dashboard scenes with Puppeteer screencast
 * 5. Convert WebM → MP4 with FFmpeg
 */

import puppeteer from 'puppeteer';
import { execSync } from 'child_process';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, 'screencast-output');

const DASHBOARD_URL = 'https://vea.pacifikai.com';
const SUPABASE_URL = 'https://aaitnegjnhjwnthcmsnr.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhaXRuZWdqbmhqd250aGNtc25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMzkxOTQsImV4cCI6MjA4NzkxNTE5NH0.-RxdcWpwenURirZJhyQRd9LVcg7i6ScL7hnPShP9UYc';
const EMAIL = 'jordy@pacifikai.com';
const IMAP_HOST = 'imap.hostinger.com';
const IMAP_PASS = 'Sennosen2258#';

const WIDTH = 1920;
const HEIGHT = 1080;

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Step 1: Send OTP ──────────────────────────────────────────
async function sendOTP() {
  console.log('📧 Sending OTP to', EMAIL);
  const res = await fetch(`${SUPABASE_URL}/auth/v1/otp`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: EMAIL }),
  });
  if (!res.ok) throw new Error(`OTP send failed: ${res.status} ${await res.text()}`);
  console.log('✅ OTP sent');
}

// ─── Step 2: Fetch OTP from email ──────────────────────────────
async function fetchOTPFromEmail(maxRetries = 10) {
  console.log('📬 Waiting for OTP email...');
  
  // Use Node.js child process to run Python IMAP script
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    await sleep(5000); // Wait 5s between attempts
    
    const result = execSync(`python3 -c "
import imaplib, email, re

mail = imaplib.IMAP4_SSL('${IMAP_HOST}')
mail.login('${EMAIL}', '${IMAP_PASS}')
mail.select('INBOX')

# Search for recent Supabase OTP emails
status, messages = mail.search(None, '(FROM \"noreply\" UNSEEN)')
ids = messages[0].split()

for msg_id in reversed(ids[-5:]):
    status, data = mail.fetch(msg_id, '(RFC822)')
    msg = email.message_from_bytes(data[0][1])
    subject = str(msg.get('Subject', ''))
    
    body = ''
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == 'text/plain':
                payload = part.get_payload(decode=True)
                if payload: body = payload.decode('utf-8', errors='ignore')
                break
            elif part.get_content_type() == 'text/html' and not body:
                payload = part.get_payload(decode=True)
                if payload: body = payload.decode('utf-8', errors='ignore')
    else:
        payload = msg.get_payload(decode=True)
        if payload: body = payload.decode('utf-8', errors='ignore')
    
    codes = re.findall(r'\\b(\\d{6})\\b', body)
    if codes and ('code' in subject.lower() or 'login' in subject.lower() or 'otp' in body.lower() or 'verification' in subject.lower()):
        print(codes[0])
        mail.logout()
        exit(0)

mail.logout()
print('NONE')
"`, { encoding: 'utf-8' }).trim();
    
    if (result && result !== 'NONE' && /^\d{6}$/.test(result)) {
      console.log(`✅ OTP found: ${result}`);
      return result;
    }
    console.log(`  Attempt ${attempt + 1}/${maxRetries}...`);
  }
  throw new Error('OTP not found in email after retries');
}

// ─── Step 3: Verify OTP → get session ──────────────────────────
async function verifyOTP(code) {
  console.log('🔑 Verifying OTP...');
  const res = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: EMAIL, token: code, type: 'email' }),
  });
  
  if (!res.ok) {
    // Try magiclink type
    const res2 = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: EMAIL, token: code, type: 'magiclink' }),
    });
    if (!res2.ok) throw new Error(`OTP verify failed: ${res2.status} ${await res2.text()}`);
    const data = await res2.json();
    console.log('✅ Session obtained (magiclink)');
    return data;
  }
  
  const data = await res.json();
  console.log('✅ Session obtained');
  return data;
}

// ─── Step 4: Record scenes ─────────────────────────────────────
async function recordScenes(session) {
  console.log('\n🎥 Starting Puppeteer recording...');
  
  const browser = await puppeteer.launch({
    headless: 'shell',
    args: [`--window-size=${WIDTH},${HEIGHT}`],
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT });
  
  // Inject Supabase session cookies
  const accessToken = session.access_token;
  const refreshToken = session.refresh_token;
  
  // Set localStorage with Supabase session before navigating
  await page.goto(DASHBOARD_URL + '/login', { waitUntil: 'networkidle2' });
  await page.evaluate((at, rt, url) => {
    const key = `sb-${new URL(url).hostname.split('.')[0]}-auth-token`;
    localStorage.setItem(key, JSON.stringify({
      access_token: at,
      refresh_token: rt,
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    }));
  }, accessToken, refreshToken, SUPABASE_URL);
  
  // Navigate to dashboard (should be authenticated now)
  await page.goto(DASHBOARD_URL + '/stats', { waitUntil: 'networkidle2' });
  await sleep(3000);
  
  const currentUrl = page.url();
  console.log('Current URL after auth:', currentUrl);
  
  if (currentUrl.includes('/login')) {
    console.log('⚠️ Still on login — trying cookie-based auth...');
    // Set cookies directly
    await page.setCookie({
      name: 'sb-access-token',
      value: accessToken,
      domain: new URL(DASHBOARD_URL).hostname,
      path: '/',
    }, {
      name: 'sb-refresh-token', 
      value: refreshToken,
      domain: new URL(DASHBOARD_URL).hostname,
      path: '/',
    });
    await page.goto(DASHBOARD_URL + '/stats', { waitUntil: 'networkidle2' });
    await sleep(3000);
    console.log('URL after cookie auth:', page.url());
  }

  // Record each scene
  const scenes = [
    { name: '01-dashboard', url: '/stats', wait: 4000, scroll: true },
    { name: '02-channels', url: '/channels', wait: 4000, scroll: true },
    { name: '03-conversations', url: '/conversations', wait: 4000, scroll: false },
    { name: '04-appointments', url: '/appointments', wait: 4000, scroll: true },
    { name: '05-settings', url: '/settings', wait: 4000, scroll: true },
  ];
  
  for (const scene of scenes) {
    console.log(`\n🎬 Recording: ${scene.name}`);
    const recorder = await page.screencast({
      path: path.join(OUTPUT_DIR, `${scene.name}.webm`),
    });
    
    await sleep(500);
    await page.goto(DASHBOARD_URL + scene.url, { waitUntil: 'networkidle2' });
    await sleep(scene.wait);
    
    if (scene.scroll) {
      for (let i = 0; i < 2; i++) {
        await page.evaluate(() => window.scrollBy(0, 300));
        await sleep(1500);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await sleep(1000);
    }
    
    await recorder.stop();
    console.log(`✅ ${scene.name} saved`);
  }
  
  await browser.close();
}

// ─── Step 5: Convert + Assemble ────────────────────────────────
function convertAndAssemble() {
  console.log('\n📦 Converting WebM → MP4...');
  const scenes = ['01-dashboard', '02-channels', '03-conversations', '04-appointments', '05-settings'];
  const mp4s = [];
  
  for (const scene of scenes) {
    const webm = path.join(OUTPUT_DIR, `${scene}.webm`);
    const mp4 = path.join(OUTPUT_DIR, `${scene}.mp4`);
    if (existsSync(webm)) {
      try {
        execSync(`ffmpeg -y -i "${webm}" -c:v libx264 -crf 18 -preset fast "${mp4}"`, { stdio: 'pipe' });
        mp4s.push(scene);
        console.log(`  ✅ ${scene}.mp4`);
      } catch (e) {
        console.log(`  ⚠️ ${scene} failed`);
      }
    }
  }
  
  // Concat all MP4s
  const concatContent = mp4s.map(s => `file '${s}.mp4'`).join('\n');
  writeFileSync(path.join(OUTPUT_DIR, 'concat.txt'), concatContent);
  
  try {
    execSync(`cd "${OUTPUT_DIR}" && ffmpeg -y -f concat -safe 0 -i concat.txt -c copy final-dashboard.mp4`, { stdio: 'pipe' });
    const size = execSync(`ls -lh "${OUTPUT_DIR}/final-dashboard.mp4" | awk '{print $5}'`, { encoding: 'utf-8' }).trim();
    console.log(`\n🎬 Final video: ${OUTPUT_DIR}/final-dashboard.mp4 (${size})`);
  } catch (e) {
    console.log('⚠️ Concat failed');
  }
}

// ─── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('🎥 Meta App Review Screencast — Full Automation\n');
  
  // Step 1: Send OTP
  await sendOTP();
  
  // Step 2: Fetch OTP from email
  const code = await fetchOTPFromEmail();
  
  // Step 3: Verify OTP
  const session = await verifyOTP(code);
  
  // Step 4: Record scenes
  await recordScenes(session);
  
  // Step 5: Convert & assemble
  convertAndAssemble();
  
  console.log('\n✅ Screencast recording complete!');
  console.log('Next steps:');
  console.log('  1. Record Messenger conversation (manual or via API test)');
  console.log('  2. Compose final video with Remotion (annotations + split-screen)');
  console.log('  3. Upload to Meta App Review');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
