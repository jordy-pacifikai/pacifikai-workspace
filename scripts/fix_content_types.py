#!/usr/bin/env python3
"""
Fix Content-Type for all HTML files in Supabase Storage
Re-uploads files with correct MIME type using x-upsert header
"""

import os
import requests
import json
from pathlib import Path
from urllib.parse import quote

# Configuration
SUPABASE_URL = "https://ogsimsfqwibcmotaeevb.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nc2ltc2Zxd2liY21vdGFlZXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTIzNjc0NiwiZXhwIjoyMDg0ODEyNzQ2fQ.b2m6CLZU_N96cXhQqvVbnX_A6HRmvGJaV1dGmD3AOCE"
BUCKET_NAME = "pacifikai-assets"

# Base path
BASE_PATH = Path(__file__).parent.parent

# Prospects folders
PROSPECTS = [
    "Air Tahiti Nui",
    "Air Tahiti",
    "Aranui",
    "COWAN MOTOR",
    "Intercontinental",
    "OPT",
    "Tahiti Tourisme",
    "The Moorings"
]

def get_content_type(filename):
    ext = filename.split('.')[-1].lower()
    return {
        'html': 'text/html',
        'htm': 'text/html',
        'md': 'text/markdown',
        'pdf': 'application/pdf',
        'json': 'application/json',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'svg': 'image/svg+xml'
    }.get(ext, 'application/octet-stream')

def reupload_file(file_path, storage_path):
    """Re-upload file with correct Content-Type"""
    # URL encode the path properly
    encoded_path = quote(storage_path, safe='/')
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{encoded_path}"

    with open(file_path, 'rb') as f:
        content = f.read()

    content_type = get_content_type(file_path.name)

    headers = {
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "apikey": SUPABASE_SERVICE_KEY,
        "Content-Type": content_type,
        "x-upsert": "true",
        "Cache-Control": "public, max-age=3600"
    }

    response = requests.post(url, headers=headers, data=content)

    if response.status_code in [200, 201]:
        return True, content_type
    else:
        return False, response.text

def fix_prospect(prospect_name):
    """Fix all HTML files for a prospect"""
    prospect_path = BASE_PATH / prospect_name

    if not prospect_path.exists():
        print(f"  [SKIP] Folder not found: {prospect_name}")
        return 0

    fixed = 0

    # Find all HTML files
    for file_path in prospect_path.rglob('*.html'):
        # Skip unwanted directories
        if any(skip in str(file_path) for skip in ['node_modules', '.git', '.vercel', '__pycache__']):
            continue

        rel_path = file_path.relative_to(prospect_path)
        storage_path = f"{prospect_name}/{rel_path}"

        print(f"  Fixing: {storage_path}...", end=" ")

        success, result = reupload_file(file_path, storage_path)

        if success:
            print(f"OK ({result})")
            fixed += 1
        else:
            print(f"FAILED: {result}")

    return fixed

def main():
    print("=" * 60)
    print("Fix Content-Type for Supabase HTML files")
    print("=" * 60)

    total_fixed = 0

    for prospect in PROSPECTS:
        print(f"\n[{prospect}]")
        fixed = fix_prospect(prospect)
        total_fixed += fixed
        print(f"  -> {fixed} files fixed")

    print(f"\n{'=' * 60}")
    print(f"DONE: {total_fixed} HTML files re-uploaded with correct Content-Type")
    print(f"{'=' * 60}")

if __name__ == "__main__":
    main()
