#!/usr/bin/env python3
"""
Upload all PACIFIK'AI assets to Supabase Storage
and create entries in Airtable Assets table
"""

import os
import requests
import json
from pathlib import Path
from datetime import datetime

# Configuration
SUPABASE_URL = "https://ogsimsfqwibcmotaeevb.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nc2ltc2Zxd2liY21vdGFlZXZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTIzNjc0NiwiZXhwIjoyMDg0ODEyNzQ2fQ.b2m6CLZU_N96cXhQqvVbnX_A6HRmvGJaV1dGmD3AOCE"
BUCKET_NAME = "pacifikai-assets"

AIRTABLE_API_KEY = "pat46LSKbLbvTLFCm.3431b75c27ab9fc638cb8e784f6559347ede36c1d9801a9df511f2aaed941faf"
AIRTABLE_BASE_ID = "appF7pltUaQkOlKM5"
AIRTABLE_TABLE_NAME = "Assets"

# Base path
BASE_PATH = Path(__file__).parent.parent

# Prospects folders to process
PROSPECTS = [
    "Air Tahiti Nui",
    "Air Tahiti",
    "Aranui",
    "Banque de Polynésie",
    "COWAN MOTOR",
    "Intercontinental",
    "OPT",
    "Tahiti Tourisme",
    "The Moorings"
]

# File type mapping
def get_asset_type(filename, folder):
    name_lower = filename.lower()
    folder_lower = folder.lower()

    if 'fiche' in name_lower or 'research' in name_lower:
        return 'fiche'
    if 'dashboard' in name_lower:
        return 'dashboard'
    if 'index' in name_lower or 'landing' in name_lower:
        return 'site'
    if 'n8n' in name_lower or 'workflow' in name_lower or 'visualizer' in name_lower:
        return 'workflow'
    if 'proposition' in name_lower or 'proposal' in name_lower:
        return 'proposition'
    if folder_lower == 'demo':
        return 'demo'
    return 'doc'

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

def upload_to_supabase(file_path, storage_path):
    """Upload file to Supabase Storage"""
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{storage_path}"

    with open(file_path, 'rb') as f:
        content = f.read()

    headers = {
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "apikey": SUPABASE_SERVICE_KEY,
        "Content-Type": get_content_type(file_path.name)
    }

    # Use upsert to overwrite if exists
    response = requests.post(url, headers=headers, data=content)

    if response.status_code in [200, 201]:
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{storage_path}"
        return True, public_url
    else:
        # Try upsert
        headers["x-upsert"] = "true"
        response = requests.post(url, headers=headers, data=content)
        if response.status_code in [200, 201]:
            public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{storage_path}"
            return True, public_url
        return False, response.text

def create_airtable_record(name, prospect, asset_type, url, description):
    """Create record in Airtable Assets table"""
    api_url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_NAME}"

    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "fields": {
            "Name": name,
            "Prospect": prospect,
            "Type": asset_type,
            "URL": url,
            "Description": description,
            "Created_At": datetime.now().isoformat()
        }
    }

    response = requests.post(api_url, headers=headers, json=data)
    return response.status_code in [200, 201], response.text

def process_prospect(prospect_name):
    """Process all assets for a prospect"""
    prospect_path = BASE_PATH / prospect_name

    if not prospect_path.exists():
        print(f"  [SKIP] Folder not found: {prospect_name}")
        return []

    uploaded = []

    # Find all HTML and PDF files (excluding node_modules, .git, etc.)
    for ext in ['*.html', '*.pdf', '*.md']:
        for file_path in prospect_path.rglob(ext):
            # Skip unwanted directories
            if any(skip in str(file_path) for skip in ['node_modules', '.git', '.vercel', '__pycache__']):
                continue

            # Get relative path within prospect folder
            rel_path = file_path.relative_to(prospect_path)
            storage_path = f"{prospect_name}/{rel_path}"

            # Determine asset type and description
            folder_name = rel_path.parent.name if rel_path.parent.name != prospect_name else ""
            asset_type = get_asset_type(file_path.name, folder_name)

            # Create readable name
            name = file_path.stem.replace('-', ' ').replace('_', ' ').title()
            description = f"{folder_name}/{file_path.name}" if folder_name else file_path.name

            print(f"  Uploading: {storage_path}...", end=" ")

            success, result = upload_to_supabase(file_path, storage_path)

            if success:
                print("OK")
                # Create Airtable record
                airtable_success, _ = create_airtable_record(
                    name=name,
                    prospect=prospect_name,
                    asset_type=asset_type,
                    url=result,
                    description=description
                )
                if airtable_success:
                    print(f"    -> Airtable record created")

                uploaded.append({
                    "name": name,
                    "file": str(rel_path),
                    "type": asset_type,
                    "url": result,
                    "desc": description
                })
            else:
                print(f"FAILED: {result}")

    return uploaded

def generate_manifest(all_assets):
    """Generate updated assets-manifest.json with Supabase URLs"""
    manifest = {
        "generated": datetime.now().isoformat(),
        "storage": "supabase",
        "bucket": BUCKET_NAME,
        "prospects": {}
    }

    for prospect, assets in all_assets.items():
        if assets:
            manifest["prospects"][prospect] = {
                "folder": prospect,
                "files": assets
            }

    manifest_path = BASE_PATH / "dashboard" / "assets-manifest.json"
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)

    print(f"\nManifest updated: {manifest_path}")

def main():
    print("=" * 60)
    print("PACIFIK'AI Assets Upload to Supabase")
    print("=" * 60)

    all_assets = {}

    for prospect in PROSPECTS:
        print(f"\n[{prospect}]")
        assets = process_prospect(prospect)
        all_assets[prospect] = assets
        print(f"  -> {len(assets)} files uploaded")

    # Generate updated manifest
    generate_manifest(all_assets)

    # Summary
    total = sum(len(a) for a in all_assets.values())
    print(f"\n{'=' * 60}")
    print(f"DONE: {total} assets uploaded to Supabase Storage")
    print(f"{'=' * 60}")

if __name__ == "__main__":
    main()
