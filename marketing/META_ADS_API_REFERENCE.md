# Meta / Facebook / Instagram Ads — Complete API Reference Guide

> **Last updated**: 2026-03-13
> **API Version**: v25.0 (launched Feb 18, 2026)
> **Previous**: v24.0 | **Deprecation cycle**: ~2 years per version

---

## Table of Contents

1. [API Setup & Authentication](#1-api-setup--authentication)
2. [Campaign Structure & Creation](#2-campaign-structure--creation)
3. [Creative Specs — All Formats & Placements](#3-creative-specs--all-formats--placements)
4. [Ad Copy Best Practices](#4-ad-copy-best-practices)
5. [object_story_spec vs asset_feed_spec](#5-object_story_spec-vs-asset_feed_spec)
6. [Dynamic Creative Optimization (DCO)](#6-dynamic-creative-optimization-dco)
7. [Targeting](#7-targeting)
8. [Bidding & Budget](#8-bidding--budget)
9. [Pixel Events & Conversions API (CAPI)](#9-pixel-events--conversions-api-capi)
10. [Insights & Reporting](#10-insights--reporting)
11. [Ad Rules Engine (Automation)](#11-ad-rules-engine-automation)
12. [Batch API & Webhooks](#12-batch-api--webhooks)
13. [Rate Limits](#13-rate-limits)
14. [Common Pitfalls & Gotchas](#14-common-pitfalls--gotchas)
15. [Call-to-Action Types — Complete List](#15-call-to-action-types--complete-list)

---

## 1. API Setup & Authentication

### Permissions Required

| Permission | Purpose |
|---|---|
| `ads_management` | Create/edit campaigns, ad sets, ads |
| `ads_read` | Read campaign data and insights |
| `business_management` | Manage ad accounts and business assets |
| `pages_show_list` | List pages for ad creation |
| `pages_read_engagement` | Read page engagement data |

### Token Types

| Token Type | Lifetime | Use Case |
|---|---|---|
| **Short-lived** | ~1-2 hours | Testing / Graph Explorer |
| **Long-lived** | ~60 days (or never with Standard access) | Server automation |
| **System User** | Never expires (if maintained) | Production server-to-server |
| **Page Token** | Inherits from user token | Page-specific operations |

**System User tokens** are the gold standard for automation:
1. Create System User in Business Manager > Business Settings > Users > System Users
2. Assign ad account assets to the System User
3. Generate token — it does NOT expire as long as app and Business Manager remain active

**Long-lived token exchange:**
```bash
curl -X GET "https://graph.facebook.com/v25.0/oauth/access_token?\
grant_type=fb_exchange_token&\
client_id={APP_ID}&\
client_secret={APP_SECRET}&\
fb_exchange_token={SHORT_LIVED_TOKEN}"
```

**Token debugger:** `https://developers.facebook.com/tools/debug/accesstoken/`

### Base URL

```
https://graph.facebook.com/v25.0/
```

---

## 2. Campaign Structure & Creation

### Hierarchy

```
Campaign (objective, budget if CBO)
└── Ad Set (targeting, budget if ABO, schedule, bid)
    └── Ad (creative + tracking)
        └── Ad Creative (images, video, copy, CTA)
```

### Campaign Objectives (ODAX — Outcome-Driven)

| Objective | API Value | Use Case |
|---|---|---|
| Awareness | `OUTCOME_AWARENESS` | Brand visibility, reach |
| Traffic | `OUTCOME_TRAFFIC` | Drive clicks to site/app |
| Engagement | `OUTCOME_ENGAGEMENT` | Post engagement, video views, page likes |
| Leads | `OUTCOME_LEADS` | Lead gen forms, conversions |
| App Promotion | `OUTCOME_APP_PROMOTION` | App installs |
| Sales | `OUTCOME_SALES` | Conversions, catalog sales |

> **WARNING**: Legacy objectives (`LINK_CLICKS`, `CONVERSIONS`, `BRAND_AWARENESS`, etc.) return **400 error** for new campaigns since 2023.

### Step 1: Create Campaign

```bash
curl -X POST \
  "https://graph.facebook.com/v25.0/act_{AD_ACCOUNT_ID}/campaigns" \
  -F "name=My Campaign" \
  -F "objective=OUTCOME_SALES" \
  -F "status=PAUSED" \
  -F "special_ad_categories=[]" \
  -F "access_token={TOKEN}"
```

Returns: `{ "id": "campaign_id" }`

### Step 2: Create Ad Set

```bash
curl -X POST \
  "https://graph.facebook.com/v25.0/act_{AD_ACCOUNT_ID}/adsets" \
  -F "name=My Ad Set" \
  -F "campaign_id={CAMPAIGN_ID}" \
  -F "daily_budget=5000" \
  -F "billing_event=IMPRESSIONS" \
  -F "optimization_goal=OFFSITE_CONVERSIONS" \
  -F "bid_strategy=LOWEST_COST_WITHOUT_CAP" \
  -F "targeting={\"geo_locations\":{\"countries\":[\"FR\"]},\"age_min\":25,\"age_max\":55}" \
  -F "promoted_object={\"pixel_id\":\"{PIXEL_ID}\",\"custom_event_type\":\"PURCHASE\"}" \
  -F "start_time=2026-03-15T00:00:00+0000" \
  -F "status=PAUSED" \
  -F "access_token={TOKEN}"
```

### Step 3: Upload Image & Create Creative

```bash
# Upload image
curl -X POST \
  "https://graph.facebook.com/v25.0/act_{AD_ACCOUNT_ID}/adimages" \
  -F "filename=@/path/to/image.jpg" \
  -F "access_token={TOKEN}"
# Returns: { "images": { "image.jpg": { "hash": "abc123..." } } }

# Create creative
curl -X POST \
  "https://graph.facebook.com/v25.0/act_{AD_ACCOUNT_ID}/adcreatives" \
  -F 'name=My Creative' \
  -F 'object_story_spec={
    "page_id": "{PAGE_ID}",
    "instagram_user_id": "{IG_USER_ID}",
    "link_data": {
      "link": "https://example.com",
      "message": "Primary text here",
      "name": "Headline here",
      "description": "Description here",
      "image_hash": "abc123...",
      "call_to_action": {
        "type": "LEARN_MORE",
        "value": { "link": "https://example.com" }
      }
    }
  }' \
  -F "access_token={TOKEN}"
```

### Step 4: Create Ad

```bash
curl -X POST \
  "https://graph.facebook.com/v25.0/act_{AD_ACCOUNT_ID}/ads" \
  -F "name=My Ad" \
  -F "adset_id={AD_SET_ID}" \
  -F "creative={\"creative_id\":\"{CREATIVE_ID}\"}" \
  -F "status=PAUSED" \
  -F "access_token={TOKEN}"
```

### Step 5: Activate

```bash
# Activate ad set (campaign can stay PAUSED until ready)
curl -X POST \
  "https://graph.facebook.com/v25.0/{AD_SET_ID}" \
  -F "status=ACTIVE" \
  -F "access_token={TOKEN}"

# Activate campaign
curl -X POST \
  "https://graph.facebook.com/v25.0/{CAMPAIGN_ID}" \
  -F "status=ACTIVE" \
  -F "access_token={TOKEN}"
```

---

## 3. Creative Specs — All Formats & Placements

### Image Ads

| Placement | Recommended Size | Aspect Ratio | Min Size | Max File Size |
|---|---|---|---|---|
| **Feed** (FB + IG) | 1080 x 1350 | 4:5 | 600 x 750 | 30 MB |
| **Feed Square** | 1080 x 1080 | 1:1 | 600 x 600 | 30 MB |
| **Stories / Reels** | 1080 x 1920 | 9:16 | 500 x 888 | 30 MB |
| **Right Column** | 1200 x 628 | 1.91:1 | 254 x 133 | 30 MB |
| **Marketplace** | 1080 x 1080 | 1:1 | 600 x 600 | 30 MB |
| **Search Results** | 1080 x 1080 | 1:1 | 600 x 600 | 30 MB |
| **Messenger Inbox** | 1080 x 1080 | 1:1 | 254 x 133 | 30 MB |
| **Audience Network** | 1200 x 628 | 1.91:1 | 254 x 133 | 30 MB |
| **Explore (IG)** | 1080 x 1080 | 1:1 | 500 x 500 | 30 MB |

**File types**: JPG, PNG (PNG for transparency)
**Universal safe size**: 1080 x 1080 works across ~80% of placements

### Video Ads

| Spec | Requirement |
|---|---|
| **Formats** | MP4, MOV (MP4 preferred) |
| **Codec** | H.264, VP8 |
| **Audio** | AAC, 128 kbps min (256 kbps recommended) |
| **Bitrate** | 5-8 Mbps for 1080p |
| **Frame Rate** | 30 fps (or 60 fps) |
| **Max File Size** | 4 GB |
| **Max Duration** | 241 minutes (15-60s optimal for engagement) |
| **Thumbnail** | Same dimensions as video, JPG/PNG |

| Placement | Dimensions | Ratio | Duration |
|---|---|---|---|
| **Feed** | 1080 x 1350 | 4:5 | 1s - 241 min |
| **Stories / Reels** | 1080 x 1920 | 9:16 | 1s - 120s (15-30s optimal) |
| **In-Stream** | 1280 x 720 | 16:9 | 5s - 15 min |

**Stories safe zone**: Keep important content away from top 250px (profile/CTA) and bottom 340px (swipe-up area).

### Carousel Ads

| Spec | Requirement |
|---|---|
| **Cards** | 2 to 10 per carousel |
| **Image/Video mix** | Yes, can mix images and videos |
| **Image size per card** | 1080 x 1080 (1:1 required) |
| **Video per card** | 1080 x 1080, 1s - 240 min |
| **Headline per card** | 40 characters max |

### Collection Ads

- Hero image/video at top + 4 product images below
- Opens into **Instant Experience** (full-screen mobile)
- Requires product catalog connected
- Hero video: same specs as feed video
- Product images: pulled from catalog

### Slideshow

- 3 to 10 images
- Creates lightweight video from static images
- Useful for low-bandwidth markets
- Duration: 5-15 seconds per slide
- Can add music from Meta's library

---

## 4. Ad Copy Best Practices

### Character Limits

| Element | Visible | Max Total | Recommendation |
|---|---|---|---|
| **Primary Text** | ~125 chars (then "See more") | 2,200 chars | 50-150 chars for best performance |
| **Headline** | ~27 chars on mobile | 255 chars | Keep under 40 chars |
| **Description** | ~27 chars | 255 chars | Keep under 30 chars |
| **URL Display** | 30 chars | — | Auto-generated from link |

### Best Practices

1. **Lead with the hook** — First 125 chars must capture attention (everything after is hidden behind "See more")
2. **One clear CTA** — Don't confuse with multiple asks
3. **Social proof** — Numbers, testimonials, results
4. **Urgency** — Limited time, scarcity (without being spammy)
5. **Question format** — Opens a loop the user wants to close
6. **Pain > Solution > CTA** — Classic direct response structure

### Emoji Impact on Performance

- **+20-57% engagement** when used strategically
- **+241% CTR** in headline (A/B test data)
- **+30-40% CTR** and **-20% CPC** vs. no-emoji ads
- Use **1-3 emojis** max per ad component
- Best positions: beginning of line, bullet points, before CTA
- **Avoid for**: luxury brands, financial services, funeral/legal industries

### French Polynesian Market Notes

- French is the primary language for ad copy
- Small audience size (~280K population) — broader targeting works better
- Higher CPM due to small market and distance
- Tahitian language elements can increase local engagement
- Mobile-first audience — optimize for mobile placements

---

## 5. object_story_spec vs asset_feed_spec

### object_story_spec — Standard Single-Creative Ads

Use when: **1 image/video, 1 text, 1 headline, 1 CTA**

```json
{
  "object_story_spec": {
    "page_id": "PAGE_ID",
    "instagram_user_id": "IG_USER_ID",
    "link_data": {
      "link": "https://example.com",
      "message": "Primary text",
      "name": "Headline",
      "description": "Description",
      "image_hash": "HASH",
      "call_to_action": {
        "type": "SHOP_NOW",
        "value": { "link": "https://example.com" }
      }
    }
  }
}
```

**Variants for `object_story_spec`:**
- `link_data` — Link ad (image + link)
- `photo_data` — Photo post (no link, engagement)
- `video_data` — Video ad
- `template_data` — Dynamic product ads

### asset_feed_spec — Multi-Variant / Dynamic Creative

Use when: **Multiple images/videos/texts for testing OR placement-specific creatives**

```json
{
  "asset_feed_spec": {
    "images": [
      { "hash": "hash1" },
      { "hash": "hash2" }
    ],
    "bodies": [
      { "text": "Primary text variant 1" },
      { "text": "Primary text variant 2" }
    ],
    "titles": [
      { "text": "Headline variant 1" },
      { "text": "Headline variant 2" }
    ],
    "descriptions": [
      { "text": "Description 1" }
    ],
    "link_urls": [
      { "website_url": "https://example.com" }
    ],
    "call_to_action_types": ["SHOP_NOW", "LEARN_MORE"],
    "ad_formats": ["SINGLE_IMAGE"]
  }
}
```

### Asset Limits for asset_feed_spec

| Asset Type | Maximum |
|---|---|
| **Images** | 10 |
| **Videos** | 10 |
| **Bodies (primary text)** | 5 |
| **Titles (headlines)** | 5 |
| **Descriptions** | 5 |
| **Link URLs** | 5 |
| **CTAs** | 5 |
| **Total items** | 30 across all fields |

### ad_formats Values

- `SINGLE_IMAGE`
- `SINGLE_VIDEO`
- `CAROUSEL`
- `AUTOMATIC_FORMAT` — Meta picks best format per user

### asset_customization_rules — Placement-Specific Creatives

Requires **minimum 2 rules**. Supported objectives: `APP_INSTALLS`, `BRAND_AWARENESS`, `CONVERSIONS`, `LEAD_GENERATION`, `LINK_CLICKS`, `REACH`, `VIDEO_VIEWS`.

```json
{
  "asset_feed_spec": {
    "images": [
      { "hash": "feed_hash", "url_tags": "placement=feed" },
      { "hash": "story_hash", "url_tags": "placement=story" }
    ],
    "bodies": [{ "text": "Copy" }],
    "titles": [{ "text": "Headline" }],
    "link_urls": [{ "website_url": "https://example.com" }],
    "call_to_action_types": ["LEARN_MORE"],
    "asset_customization_rules": [
      {
        "customization_spec": {
          "publisher_platforms": ["facebook"],
          "facebook_positions": ["feed"]
        },
        "image_label": { "name": "feed_hash" }
      },
      {
        "customization_spec": {
          "publisher_platforms": ["facebook", "instagram"],
          "facebook_positions": ["story"],
          "instagram_positions": ["story"]
        },
        "image_label": { "name": "story_hash" }
      }
    ]
  }
}
```

---

## 6. Dynamic Creative Optimization (DCO)

### What It Does

Meta's algorithm tests all combinations of uploaded assets (images x headlines x texts x CTAs) and optimizes delivery toward best-performing combinations per audience segment.

### How to Enable

Set at **ad set level**:

```bash
curl -X POST \
  "https://graph.facebook.com/v25.0/act_{AD_ACCOUNT_ID}/adsets" \
  -F "is_dynamic_creative=true" \
  -F "..." \
  -F "access_token={TOKEN}"
```

Then create ad creative with `asset_feed_spec` (NOT `object_story_spec`).

### Asset Recommendations for DCO

| Asset | Recommended Count |
|---|---|
| Images/Videos | 3-10 |
| Headlines | 3-5 |
| Primary Text | 3-5 |
| Descriptions | 2-3 |
| CTAs | 2-3 |

### Advantage+ Creative (replaces old DCO in 2025-2026)

Advantage+ Creative goes beyond DCO — it auto-generates variations including:
- Text overlays on images
- Aspect ratio cropping per placement
- Brightness/contrast adjustments
- Music addition for Reels

Enable via:
```json
{
  "degrees_of_freedom_spec": {
    "creative_features_spec": {
      "standard_enhancements": { "enroll_status": "OPT_IN" }
    }
  }
}
```

To **disable** Advantage+ Creative enhancements:
```json
{
  "degrees_of_freedom_spec": {
    "creative_features_spec": {
      "standard_enhancements": { "enroll_status": "OPT_OUT" }
    }
  }
}
```

---

## 7. Targeting

### Full Targeting Spec Structure

```json
{
  "targeting": {
    "geo_locations": {
      "countries": ["FR", "PF"],
      "regions": [{ "key": "1234" }],
      "cities": [{ "key": "5678", "radius": 25, "distance_unit": "kilometer" }],
      "zips": [{ "key": "US:90210" }],
      "custom_locations": [{ "latitude": -17.535, "longitude": -149.569, "radius": 50, "distance_unit": "kilometer" }],
      "location_types": ["home", "recent"]
    },
    "excluded_geo_locations": {
      "countries": ["XX"]
    },
    "age_min": 18,
    "age_max": 65,
    "genders": [0],
    "locales": [6],
    "interests": [
      { "id": "6003139266461", "name": "Trading" }
    ],
    "behaviors": [
      { "id": "123456", "name": "Engaged Shoppers" }
    ],
    "life_events": [],
    "relationship_statuses": [],
    "custom_audiences": [
      { "id": "CUSTOM_AUDIENCE_ID" }
    ],
    "excluded_custom_audiences": [
      { "id": "EXCLUDE_AUDIENCE_ID" }
    ],
    "flexible_spec": [
      {
        "interests": [{ "id": "111", "name": "Finance" }],
        "behaviors": [{ "id": "222", "name": "Small business owners" }]
      }
    ],
    "exclusions": {
      "interests": [{ "id": "333", "name": "Excluded interest" }]
    },
    "publisher_platforms": ["facebook", "instagram", "audience_network", "messenger"],
    "facebook_positions": ["feed", "right_hand_column", "marketplace", "video_feeds", "story", "search", "instream_video", "reels"],
    "instagram_positions": ["stream", "story", "explore", "reels", "profile_feed", "ig_search"],
    "device_platforms": ["mobile", "desktop"],
    "targeting_optimization": "none"
  }
}
```

### Gender Values

| Value | Meaning |
|---|---|
| `0` | All |
| `1` | Male |
| `2` | Female |

### Advantage+ Audience (AI-Driven)

Enable with:
```json
{
  "targeting_automation": {
    "advantage_audience": 1
  }
}
```

When enabled, only `geo_locations` targeting is respected. All other targeting becomes "suggestions" that Meta's AI can expand beyond.

### 2026 Targeting Changes

- **Detailed targeting exclusions REMOVED** (since March 2025)
- Many interest categories consolidated or retired (fully enforced January 15, 2026)
- `flexible_spec` with OR logic between groups, AND within groups
- Lookalike `lookalike_spec` field now **mandatory** for creating new lookalike audiences (since January 6, 2026)

---

## 8. Bidding & Budget

### Bid Strategies

| Strategy | API Value | Behavior |
|---|---|---|
| **Lowest Cost** (default) | `LOWEST_COST_WITHOUT_CAP` | Spend full budget, get most results at lowest cost |
| **Cost Cap** | `COST_CAP` | Average CPA target (flexible) |
| **Bid Cap** | `LOWEST_COST_WITH_BID_CAP` | Hard max bid per auction |
| **Minimum ROAS** | `LOWEST_COST_WITH_MIN_ROAS` | Minimum return on ad spend target |

### Budget Types

| Type | Field | Notes |
|---|---|---|
| **Daily Budget** | `daily_budget` | In cents (e.g., 5000 = $50.00) |
| **Lifetime Budget** | `lifetime_budget` | Requires `end_time` |
| **CBO (Campaign Budget)** | Set on campaign, not ad set | `campaign_budget_optimization=true` |

### Advantage Campaign Budget (CBO)

```bash
curl -X POST \
  "https://graph.facebook.com/v25.0/act_{AD_ACCOUNT_ID}/campaigns" \
  -F "name=CBO Campaign" \
  -F "objective=OUTCOME_SALES" \
  -F "status=PAUSED" \
  -F "daily_budget=10000" \
  -F "bid_strategy=LOWEST_COST_WITHOUT_CAP" \
  -F "access_token={TOKEN}"
```

### Scheduling & Dayparting

```json
{
  "start_time": "2026-03-15T08:00:00-1000",
  "end_time": "2026-04-15T23:59:59-1000",
  "adset_schedule": [
    {
      "start_minute": 480,
      "end_minute": 1080,
      "days": [1, 2, 3, 4, 5],
      "timezone_type": "USER"
    }
  ],
  "pacing_type": ["standard"]
}
```

> `start_minute`: minutes from midnight (480 = 8:00 AM). `days`: 0=Sun, 1=Mon, ... 6=Sat.

---

## 9. Pixel Events & Conversions API (CAPI)

### Standard Pixel Events — Complete List

| Event | Description | Required Params | Recommended Params |
|---|---|---|---|
| `AddPaymentInfo` | Payment info added at checkout | — | `content_ids`, `contents`, `currency`, `value` |
| `AddToCart` | Product added to cart | `contents` (for Advantage+) | `content_ids`, `content_type`, `currency`, `value` |
| `AddToWishlist` | Product added to wishlist | — | `content_ids`, `contents`, `currency`, `value` |
| `CompleteRegistration` | Registration form completed | — | `currency`, `value`, `status` |
| `Contact` | Business contact initiated | — | — |
| `CustomizeProduct` | Product customized | — | — |
| `Donate` | Donation made | — | — |
| `FindLocation` | Store location searched | — | — |
| `InitiateCheckout` | Checkout started | — | `content_ids`, `contents`, `currency`, `num_items`, `value` |
| `Lead` | Lead/signup submitted | — | `currency`, `value` |
| `Purchase` | Transaction completed | `currency`, `value` | `content_ids`, `content_type`, `contents`, `num_items` |
| `Schedule` | Appointment booked | — | — |
| `Search` | Search performed | — | `content_ids`, `content_type`, `contents`, `currency`, `search_string`, `value` |
| `StartTrial` | Free trial started | — | `currency`, `predicted_ltv`, `value` |
| `SubmitApplication` | Application submitted | — | — |
| `Subscribe` | Paid subscription started | — | `currency`, `predicted_ltv`, `value` |
| `ViewContent` | Content page viewed | — | `content_ids`, `content_type`, `contents`, `currency`, `value` |

### Browser Pixel Implementation

```javascript
fbq('track', 'Purchase', {
  value: 49.00,
  currency: 'EUR',
  content_ids: ['PROD_123'],
  content_type: 'product',
  num_items: 1
});
```

### Conversions API (CAPI) — Server-Side

```bash
curl -X POST \
  "https://graph.facebook.com/v25.0/{PIXEL_ID}/events" \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      {
        "event_name": "Purchase",
        "event_time": 1710345600,
        "action_source": "website",
        "event_source_url": "https://example.com/checkout",
        "user_data": {
          "em": ["HASHED_EMAIL"],
          "ph": ["HASHED_PHONE"],
          "client_ip_address": "1.2.3.4",
          "client_user_agent": "Mozilla/5.0...",
          "fbc": "fb.1.123456.abcdef",
          "fbp": "fb.1.789012.ghijkl"
        },
        "custom_data": {
          "currency": "EUR",
          "value": 49.00,
          "content_ids": ["PROD_123"],
          "content_type": "product"
        },
        "event_id": "event_unique_id_123"
      }
    ],
    "access_token": "{TOKEN}"
  }'
```

### Deduplication (Pixel + CAPI)

Use **identical `event_id`** in both browser pixel and CAPI call. Meta deduplicates within a 48-hour window.

```javascript
// Browser
fbq('track', 'Purchase', { value: 49, currency: 'EUR' }, { eventID: 'order_abc123' });
```
```bash
# Server (same event_id)
"event_id": "order_abc123"
```

### User Data Hashing

All PII must be SHA-256 hashed before sending:
- `em` — email (lowercase, trimmed)
- `ph` — phone (digits only, with country code)
- `fn`, `ln` — first/last name (lowercase)
- `ct`, `st`, `zp` — city, state, zip (lowercase)
- `country` — 2-letter ISO code (lowercase)
- `db` — date of birth (YYYYMMDD)
- `ge` — gender (m/f)

**NOT hashed**: `fbc`, `fbp`, `client_ip_address`, `client_user_agent`

### Attribution Windows (2026 Update)

| Window | Status |
|---|---|
| 1-day click | Active |
| 7-day click | Active (default) |
| 1-day view | Active |
| 7-day view | **DEPRECATED** (Jan 12, 2026) |
| 28-day view | **DEPRECATED** (Jan 12, 2026) |
| 28-day click | **DEPRECATED** (years ago) |

---

## 10. Insights & Reporting

### Basic Insights Query

```bash
curl -X GET \
  "https://graph.facebook.com/v25.0/{AD_ACCOUNT_OR_CAMPAIGN_ID}/insights?\
  fields=impressions,reach,spend,clicks,ctr,cpc,cpm,actions,cost_per_action_type&\
  time_range={\"since\":\"2026-03-01\",\"until\":\"2026-03-13\"}&\
  level=ad&\
  access_token={TOKEN}"
```

### Level Parameter

| Value | Scope |
|---|---|
| `account` | Whole ad account |
| `campaign` | Per campaign |
| `adset` | Per ad set |
| `ad` | Per individual ad |

### Key Metrics Fields

| Field | Description |
|---|---|
| `impressions` | Times ad was shown |
| `reach` | Unique people who saw the ad |
| `frequency` | Average times each person saw the ad |
| `spend` | Total amount spent |
| `clicks` | All clicks (including social) |
| `inline_link_clicks` | Clicks on links in the ad |
| `ctr` | Click-through rate (all) |
| `inline_link_click_ctr` | CTR on links only |
| `cpc` | Cost per click |
| `cpm` | Cost per 1,000 impressions |
| `cpp` | Cost per 1,000 people reached |
| `actions` | Array of action objects by type |
| `action_values` | Value of actions (for ROAS) |
| `cost_per_action_type` | CPA broken down by action |
| `purchase_roas` | Return on ad spend |
| `video_avg_time_watched_actions` | Avg video watch time |
| `video_p25_watched_actions` | 25% video views |
| `video_p50_watched_actions` | 50% video views |
| `video_p75_watched_actions` | 75% video views |
| `video_p100_watched_actions` | 100% video views |

### Breakdown Fields — Complete List

**Demographic/Geographic:**
`age`, `gender`, `country`, `region`, `dma`

**Platform/Placement:**
`publisher_platform`, `platform_position`, `device_platform`, `impression_device`

**Time:**
`hourly_stats_aggregated_by_advertiser_time_zone`, `hourly_stats_aggregated_by_audience_time_zone`

**Creative:**
`ad_format_asset`, `body_asset`, `call_to_action_asset`, `description_asset`, `image_asset`, `link_url_asset`, `title_asset`, `video_asset`

**Action:**
`action_type`, `action_device`, `action_destination`, `action_reaction`, `action_target_id`, `action_canvas_component_name`, `action_carousel_card_id`, `action_carousel_card_name`, `action_video_sound`, `action_video_type`

**Other:**
`frequency_value`, `place_page_id`, `product_id`, `skan_campaign_id`, `skan_conversion_id`, `user_segment_key`

### Action Breakdowns

`action_device`, `action_type`, `action_destination`, `action_reaction`, `action_target_id`, `action_video_sound`, `action_video_type`, `conversion_destination`, `matched_persona_id`, `matched_persona_name`, `signal_source_bucket`, `standard_event_content_type`, `is_business_ai_assisted`

### Async Reports (for large queries)

```bash
# Step 1: Create async report
curl -X POST \
  "https://graph.facebook.com/v25.0/act_{AD_ACCOUNT_ID}/insights" \
  -F "fields=impressions,reach,spend,ctr,cpc" \
  -F "time_range={\"since\":\"2025-01-01\",\"until\":\"2026-03-01\"}" \
  -F "level=ad" \
  -F "breakdowns=age,gender" \
  -F "access_token={TOKEN}"
# Returns: { "report_run_id": "123456" }

# Step 2: Poll status
curl "https://graph.facebook.com/v25.0/{REPORT_RUN_ID}?fields=async_status,async_percent_completion&access_token={TOKEN}"
# Wait until async_status = "Job Completed"

# Step 3: Fetch results
curl "https://graph.facebook.com/v25.0/{REPORT_RUN_ID}/insights?access_token={TOKEN}"
```

> Async reports expire after **30 days**. Max **10 async reach requests/day** per ad account.

### Data Retention Limits (Since Jan 12, 2026)

| Data Type | Retention |
|---|---|
| Standard metrics | Unlimited |
| Unique-count fields (breakdowns) | 13 months |
| Hourly breakdowns | 13 months |
| Frequency breakdowns | 6 months |
| MMM breakdowns | Async only |

---

## 11. Ad Rules Engine (Automation)

### Create an Automated Rule

```bash
curl -X POST \
  "https://graph.facebook.com/v25.0/act_{AD_ACCOUNT_ID}/adrules_library" \
  -F 'name=Pause High CPA Ads' \
  -F 'evaluation_spec={
    "evaluation_type": "SCHEDULE",
    "filters": [
      { "field": "entity_type", "value": "AD", "operator": "EQUAL" },
      { "field": "time_preset", "value": "LAST_7_DAYS", "operator": "EQUAL" },
      { "field": "spent", "value": 1000, "operator": "GREATER_THAN" },
      { "field": "cost_per_action_type", "value": 2000, "operator": "GREATER_THAN" }
    ]
  }' \
  -F 'execution_spec={ "execution_type": "PAUSE" }' \
  -F 'schedule_spec={ "schedule_type": "DAILY" }' \
  -F "access_token={TOKEN}"
```

### Evaluation Types

| Type | Behavior |
|---|---|
| `SCHEDULE` | Runs on a schedule (daily, hourly, etc.) |
| `TRIGGER` | Runs when ad status/data changes |

### Execution Types

| Type | Description |
|---|---|
| `PAUSE` | Pause the ad/adset/campaign |
| `UNPAUSE` | Reactivate |
| `CHANGE_BUDGET` | Adjust budget (requires `change_spec`) |
| `CHANGE_BID` | Adjust bid (requires `change_spec`) |
| `NOTIFICATION` | Send notification only |
| `ROTATE` | Rotate creatives |

### Change Spec (for budget/bid adjustments)

```json
{
  "execution_type": "CHANGE_BUDGET",
  "execution_options": [{
    "field": "daily_budget",
    "value": 500,
    "operator": "INCREASE",
    "unit": "PERCENTAGE",
    "limit": { "value": 20000 }
  }]
}
```

### Schedule Spec Options

| Type | Description |
|---|---|
| `DAILY` | Once per day |
| `HOURLY` | Every hour |
| `SEMI_HOURLY` | Every 30 minutes |
| `CUSTOM` | Custom schedule with specific times/days |

### Filter Operators

`GREATER_THAN`, `LESS_THAN`, `EQUAL`, `NOT_EQUAL`, `IN_RANGE`, `NOT_IN_RANGE`, `IN`, `NOT_IN`, `ANY`, `ALL`, `NONE`, `CONTAIN`, `NOT_CONTAIN`

### Time Presets for Evaluation

`LIFETIME`, `TODAY`, `YESTERDAY`, `LAST_2_DAYS`, `LAST_3_DAYS`, `LAST_7_DAYS`, `LAST_14_DAYS`, `LAST_28_DAYS`, `LAST_30_DAYS`, `THIS_MONTH`, `THIS_WEEK_MON_TODAY`, `THIS_WEEK_SUN_TODAY`

### Common Automation Recipes

**Pause when CPA > 1.5x target:**
```json
{
  "filters": [
    { "field": "entity_type", "value": "AD", "operator": "EQUAL" },
    { "field": "time_preset", "value": "LAST_7_DAYS", "operator": "EQUAL" },
    { "field": "spent", "value": 500, "operator": "GREATER_THAN" },
    { "field": "cost_per_action_type", "value": 1500, "operator": "GREATER_THAN" }
  ]
}
```

**Scale winning ad sets (increase budget +20% when ROAS > 3):**
```json
{
  "evaluation_spec": {
    "evaluation_type": "SCHEDULE",
    "filters": [
      { "field": "entity_type", "value": "ADSET", "operator": "EQUAL" },
      { "field": "time_preset", "value": "LAST_3_DAYS", "operator": "EQUAL" },
      { "field": "purchase_roas", "value": 3, "operator": "GREATER_THAN" }
    ]
  },
  "execution_spec": {
    "execution_type": "CHANGE_BUDGET",
    "execution_options": [{
      "field": "daily_budget",
      "value": 20,
      "operator": "INCREASE",
      "unit": "PERCENTAGE",
      "limit": { "value": 50000 }
    }]
  },
  "schedule_spec": { "schedule_type": "DAILY" }
}
```

---

## 12. Batch API & Webhooks

### Batch Requests

Combine up to **50 requests** in a single HTTP call:

```bash
curl -X POST "https://graph.facebook.com/v25.0/" \
  -F 'batch=[
    { "method": "GET", "relative_url": "act_{AD_ACCOUNT_ID}/campaigns?fields=name,status&limit=10" },
    { "method": "GET", "relative_url": "act_{AD_ACCOUNT_ID}/adsets?fields=name,daily_budget&limit=10" },
    { "method": "POST", "relative_url": "act_{AD_ACCOUNT_ID}/campaigns", "body": "name=New Campaign&objective=OUTCOME_TRAFFIC&status=PAUSED" }
  ]' \
  -F "access_token={TOKEN}"
```

### Batch with Dependencies

```json
[
  {
    "method": "POST",
    "relative_url": "act_{AD_ACCOUNT_ID}/campaigns",
    "body": "name=Campaign&objective=OUTCOME_SALES&status=PAUSED",
    "name": "create-campaign"
  },
  {
    "method": "POST",
    "relative_url": "act_{AD_ACCOUNT_ID}/adsets",
    "body": "name=Ad Set&campaign_id={result=create-campaign:$.id}&daily_budget=5000&billing_event=IMPRESSIONS&optimization_goal=OFFSITE_CONVERSIONS&targeting={\"geo_locations\":{\"countries\":[\"FR\"]}}&status=PAUSED",
    "depends_on": "create-campaign"
  }
]
```

### Webhooks for Ad Status Changes

Subscribe to ad account updates:

```bash
curl -X POST \
  "https://graph.facebook.com/v25.0/{APP_ID}/subscriptions" \
  -F "object=ad_account" \
  -F "callback_url=https://your-server.com/webhook" \
  -F "fields=campaigns,adsets,ads" \
  -F "verify_token=YOUR_VERIFY_TOKEN" \
  -F "access_token={APP_TOKEN}"
```

Webhook payloads include: ad status changes, budget changes, and delivery status updates.

### Async Batch (Marketing API Specific)

For heavy ad operations:

```bash
curl -X POST \
  "https://graph.facebook.com/v25.0/act_{AD_ACCOUNT_ID}/async_batch_requests" \
  -F 'adbatch=[
    { "method": "POST", "relative_url": ".", "body": "name=Ad1&adset_id=123&creative={\"creative_id\":\"456\"}&status=PAUSED" },
    { "method": "POST", "relative_url": ".", "body": "name=Ad2&adset_id=123&creative={\"creative_id\":\"789\"}&status=PAUSED" }
  ]' \
  -F "access_token={TOKEN}"
```

---

## 13. Rate Limits

### Scoring System

| Operation | Points |
|---|---|
| Read (GET) | 1 point |
| Write (POST/UPDATE/DELETE) | 3 points |

### Tier Limits

| Tier | Max Points | Decay Rate | Block Duration |
|---|---|---|---|
| **Development** | 60 | 300 seconds | 300 seconds |
| **Standard** | 9,000 | 300 seconds | 60 seconds |

### Mutation Rate Limit

**100 requests/second** per app + ad account combination for create/update operations.
Exceeding triggers error code **613** (subcode 5044001).

### Business Use Case (BUC) Rate Limits (per hour)

| Use Case | Standard Tier | Development Tier |
|---|---|---|
| `ads_management` | 100,000 + 40x active ads | 300 + 40x active ads |
| `ads_insights` | 190,000 + 400x active ads | 600 + 400x active ads |
| `custom_audience` | 190,000 - 700,000 + 40x audiences | 5,000 + 40x audiences |

### Headers to Monitor

| Header | Content |
|---|---|
| `X-Ad-Account-Usage` | Utilization %, reset duration, access tier |
| `X-Business-Use-Case` | Call counts, CPU time, wall time |
| `X-FB-Ads-Insights-Throttle` | `app_id_util_pct`, `acc_id_util_pct`, `ads_api_access_tier` |

### Error Codes

| Code | Subcode | Meaning |
|---|---|---|
| 17 | — | Account-level throttling |
| 613 | 5044001 | Mutation rate limit exceeded |
| 4 | 1504022 | Insights throttling |
| 80000-80014 | — | BUC limit exceeded |
| 100 | 1487534 | Data limit per call exceeded |
| 1487225 | — | Ad creation limit reached |

### Mitigation

1. Distribute requests uniformly (no bursts)
2. Use batch operations (up to 50/batch)
3. Implement exponential backoff on errors
4. Use async reports for large insights queries
5. Monitor `X-*` headers proactively

---

## 14. Common Pitfalls & Gotchas

### Creative & Policy

| Issue | Solution |
|---|---|
| **20% text rule** | No longer enforced as hard rejection (since 2021). Still recommended — less text = better delivery & lower cost |
| **Ad rejected** | Common reasons: health/political/financial claims, misleading before/after, excessive skin, broken landing page, restricted categories without `special_ad_categories` |
| **Special Ad Categories** | Must declare `HOUSING`, `EMPLOYMENT`, `CREDIT`, `SOCIAL_ISSUES_ELECTIONS_OR_POLITICS` — limits targeting options |
| **Landing page mismatch** | Ad content must match landing page. Cloaking = permanent ban |
| **Fast editing** | Frequent edits reset ad learning phase. Wait 7 days minimum |

### Account & Token

| Issue | Solution |
|---|---|
| **Token expiration** | Use System User tokens (never expire). Exchange short-lived for long-lived if needed |
| **Ad account spending limit** | Check & increase in Business Settings. New accounts start with low limits that auto-increase |
| **Daily spending limits by Meta** | New accounts have Meta-imposed limits. Build trust gradually |
| **Account disabled** | Appeal via Business Help Center. Can take 2-4 weeks |

### Instagram Placements

| Issue | Solution |
|---|---|
| **IG account required** | Must connect Instagram Professional Account to Facebook Page |
| **Field deprecation** | `instagram_actor_id` → `instagram_user_id` (migrate before Jan 21, 2026) |
| **IG-only video** | Only square (1:1) or landscape (16:9) supported. Vertical (9:16) for Stories/Reels only |
| **Page-backed IG** | If no IG account, Meta creates a "page-backed" IG identity. Limited features |

### API & Technical

| Issue | Solution |
|---|---|
| **Learning phase** | ~50 optimization events needed. Don't edit during this period |
| **Budget in cents** | `daily_budget=5000` = $50.00 (NOT $5,000) |
| **Creative can't be edited** | Create a new creative, update the ad to point to it |
| **Advantage+ migration** | Legacy ASC/AAC APIs deprecated in v25.0 (Q1 2026). Migrate to unified Advantage+ |
| **Payload size** | Max 30 MB for batch API requests |

### Performance

| Issue | Solution |
|---|---|
| **Creative fatigue** | Frequency > 3.4 = declining performance. Rotate every 7-21 days |
| **Audience saturation** | Audience reached > 80% = expand targeting or refresh |
| **Budget allocation** | 80% scaling winners / 20% testing new creatives |
| **Attribution confusion** | Default is 7-day click + 1-day view. Compare same windows across campaigns |

---

## 15. Call-to-Action Types — Complete List

All 123 CTA types available in the Marketing API:

### Most Used (Recommended)

| CTA | Best For |
|---|---|
| `LEARN_MORE` | General awareness, blog posts |
| `SHOP_NOW` | E-commerce, product pages |
| `SIGN_UP` | Email lists, registrations |
| `BOOK_NOW` | Appointments, reservations |
| `CONTACT_US` | Lead generation |
| `GET_QUOTE` | Services, insurance |
| `APPLY_NOW` | Jobs, loans, programs |
| `DOWNLOAD` | Apps, ebooks, PDFs |
| `GET_OFFER` | Promotions, discounts |
| `ORDER_NOW` | Food delivery, quick commerce |
| `SUBSCRIBE` | SaaS, memberships |
| `WHATSAPP_MESSAGE` | WhatsApp Business |
| `SEND_A_GIFT` | Gift cards |
| `GET_STARTED` | Onboarding flows |

### Full Enum List (alphabetical)

```
ADD_TO_CART, APPLY_NOW, ASK_ABOUT_SERVICES, ASK_A_QUESTION, ASK_FOR_MORE_INFO,
AUDIO_CALL, BOOK_A_CONSULTATION, BOOK_NOW, BOOK_TRAVEL, BROWSE_SHOP,
BUY, BUY_NOW, BUY_TICKETS, BUY_VIA_MESSAGE,
CALL, CALL_ME, CALL_NOW, CHAT_NOW, CHAT_WITH_US, CONFIRM, CONTACT, CONTACT_US,
DONATE, DONATE_NOW, DOWNLOAD,
EVENT_RSVP,
FIND_A_GROUP, FIND_OUT_MORE, FIND_YOUR_GROUPS, FOLLOW_NEWS_STORYLINE,
FOLLOW_PAGE, FOLLOW_USER,
GET_A_QUOTE, GET_DETAILS, GET_DIRECTIONS, GET_IN_TOUCH, GET_OFFER,
GET_OFFER_VIEW, GET_PROMOTIONS, GET_QUOTE, GET_SHOWTIMES, GET_STARTED,
INQUIRE_NOW, INSTALL_APP, INSTALL_MOBILE_APP,
JOIN_CHANNEL,
LEARN_MORE, LIKE_PAGE, LISTEN_MUSIC, LISTEN_NOW,
MAKE_AN_APPOINTMENT, MESSAGE_PAGE, MOBILE_DOWNLOAD,
NO_BUTTON,
OPEN_INSTANT_APP, OPEN_LINK, ORDER_NOW,
PAY_TO_ACCESS, PLAY_GAME, PLAY_GAME_ON_FACEBOOK, PURCHASE_GIFT_CARDS,
RAISE_MONEY, RECORD_NOW, REFER_FRIENDS, REQUEST_TIME,
SAY_THANKS, SCROLL_MORE, SEE_MORE, SEE_SHOP, SELL_NOW, SEND_A_GIFT,
SEND_GIFT_MONEY, SEND_UPDATES, SHARE, SHOP_NOW, SHOP_WITH_AI,
SIGN_UP, START_A_CHAT, START_ORDER, SUBSCRIBE, SWIPE_UP_PRODUCT, SWIPE_UP_SHOP,
TRY_DEMO, TRY_ON_WITH_AI,
UPDATE_APP, USE_APP, USE_MOBILE_APP,
VIDEO_ANNOTATION, VIDEO_CALL, VIEW_CART, VIEW_CHANNEL, VIEW_IN_CART, VIEW_PRODUCT,
VISIT_PAGES_FEED, VISIT_WEBSITE,
WATCH_LIVE_VIDEO, WATCH_MORE, WATCH_VIDEO, WHATSAPP_MESSAGE
```

> Not all CTAs are available for all objectives and placements. The API will return an error if an unsupported CTA is used.

---

## Quick Reference: Recommended Workflow

```
1. System User Token (never expires)
2. POST /campaigns (PAUSED, OUTCOME_SALES)
3. POST /adimages (upload creative assets)
4. POST /adcreatives (object_story_spec or asset_feed_spec)
5. POST /adsets (targeting, budget, bid, promoted_object)
6. POST /ads (link creative to ad set, PAUSED)
7. Review in Ads Manager (verify everything)
8. POST /{campaign_id} status=ACTIVE
9. GET /insights (monitor daily)
10. POST /adrules_library (automate pause/scale)
```

---

## Sources

- [Meta Marketing API Documentation](https://developers.facebook.com/docs/marketing-api)
- [Graph API v25.0 Changelog](https://developers.facebook.com/docs/marketing-api/marketing-api-changelog/version25.0)
- [Ad Creative Reference](https://developers.facebook.com/docs/marketing-api/reference/ad-creative/)
- [Ad Set Reference](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign/)
- [Asset Feed Spec](https://developers.facebook.com/docs/marketing-api/ad-creative/asset-feed-spec/)
- [Asset Feed Options](https://developers.facebook.com/docs/marketing-api/ad-creative/asset-feed-spec/options/)
- [Asset Customization Rules](https://developers.facebook.com/docs/marketing-api/ad-creative/asset-feed-spec/asset-customization-rules/)
- [CTA Reference](https://developers.facebook.com/docs/marketing-api/reference/ad-creative-link-data-call-to-action/)
- [Basic Targeting](https://developers.facebook.com/docs/marketing-api/audiences/reference/basic-targeting/)
- [Insights Breakdowns](https://developers.facebook.com/docs/marketing-api/insights/breakdowns/)
- [Insights Best Practices](https://developers.facebook.com/docs/marketing-api/insights/best-practices/)
- [Rate Limiting](https://developers.facebook.com/docs/marketing-api/overview/rate-limiting/)
- [Ad Rules Engine](https://developers.facebook.com/docs/marketing-api/ad-rules)
- [Batch Requests](https://developers.facebook.com/docs/graph-api/batch-requests)
- [Conversions API](https://developers.facebook.com/docs/marketing-api/conversions-api/)
- [Meta Pixel Reference](https://developers.facebook.com/docs/meta-pixel/reference)
- [Access Tokens](https://developers.facebook.com/docs/facebook-login/guides/access-tokens/)
- [Shopify Ad Specs Guide 2026](https://www.shopify.com/blog/facebook-ad-sizes)
- [Buffer Ad Specs Guide 2026](https://buffer.com/resources/facebook-ad-specs-image-sizes/)
- [AdManage.ai API Guide](https://admanage.ai/blog/meta-ads-api)
- [Meta Attribution Changes 2026](https://www.dataslayer.ai/blog/meta-ads-attribution-window-removed-january-2026)
- [WordStream Campaign Objectives 2026](https://www.wordstream.com/blog/facebook-ad-objectives)
- [Jon Loomer Bid Strategies](https://www.jonloomer.com/facebook-ads-bid-strategies/)
- [BestEver Emojis in Ads](https://www.bestever.ai/post/emojis-for-facebook-ads)
- [Pansofic Meta Ads Changes 2026](https://www.pansofic.com/blog/meta-ads-changes-2026-setup-guide)
