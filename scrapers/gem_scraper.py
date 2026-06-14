"""
Scrapes GeM (Government e-Marketplace) for Karnataka AI-related procurement.
Deposits findings as evidence rows in Supabase for admin review.

Run: python scrapers/gem_scraper.py
Schedule: GitHub Actions cron (weekly)
"""

import os
import httpx
from datetime import datetime
from supabase import create_client
from dotenv import load_dotenv

load_dotenv("web/.env.local")

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

AI_KEYWORDS = ["artificial intelligence", "machine learning", "AI", "deep learning", "NLP", "computer vision"]
STATE_FILTER = "Karnataka"

GEM_SEARCH_URL = "https://mkp.gem.gov.in/api/v2/search/bids"

def fetch_gem_bids(keyword: str) -> list[dict]:
    params = {
        "query": keyword,
        "state": STATE_FILTER,
        "page": 1,
        "limit": 50,
    }
    try:
        r = httpx.get(GEM_SEARCH_URL, params=params, timeout=15)
        r.raise_for_status()
        return r.json().get("data", [])
    except Exception as e:
        print(f"  GeM fetch failed for '{keyword}': {e}")
        return []

def match_promise(db, description: str) -> str | None:
    """Return promise_id if the bid description matches a tracked promise."""
    res = db.from_("promises").select("id, text").execute()
    description_lower = description.lower()
    for row in (res.data or []):
        keywords = [w for w in row["text"].lower().split() if len(w) > 5]
        if sum(1 for k in keywords if k in description_lower) >= 2:
            return row["id"]
    return None

def run():
    db = create_client(SUPABASE_URL, SUPABASE_KEY)
    seen_bid_ids: set[str] = set()
    inserted = 0

    for keyword in AI_KEYWORDS:
        print(f"Searching GeM: '{keyword}'")
        bids = fetch_gem_bids(keyword)

        for bid in bids:
            bid_id = str(bid.get("bid_number") or bid.get("id", ""))
            if not bid_id or bid_id in seen_bid_ids:
                continue
            seen_bid_ids.add(bid_id)

            title = bid.get("title") or bid.get("name") or ""
            published = bid.get("published_date") or bid.get("start_date")
            bid_url = f"https://mkp.gem.gov.in/bids/{bid_id}" if bid_id else None

            promise_id = match_promise(db, title)
            if not promise_id:
                continue

            existing = db.from_("evidence").select("id").eq("source_url", bid_url).execute()
            if existing.data:
                continue

            db.from_("evidence").insert({
                "promise_id": promise_id,
                "type": "procurement_issued",
                "source_url": bid_url,
                "description": f"GeM bid found: {title}",
                "found_at": published or datetime.utcnow().isoformat(),
                "verified_by_human": False,
            }).execute()
            inserted += 1
            print(f"  → Inserted evidence for promise {promise_id}: {title[:60]}")

    print(f"\nDone. {inserted} new evidence items inserted (pending human review).")

if __name__ == "__main__":
    run()
