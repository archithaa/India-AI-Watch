"""
Daily news RSS scraper for India AI Watch.

Sources: The Hindu, Deccan Herald, NDTV, Scroll, Economic Times
Pipeline:
  1. Fetch RSS feeds
  2. Filter articles by Karnataka + AI keywords
  3. Match each article against tracked promises (keyword heuristic, then Groq confirmation)
  4. Insert evidence rows (verified_by_human=False) for admin review

Run: python scrapers/news_scraper.py
Schedule: GitHub Actions cron — daily at 6am UTC
"""

import os
import json
import hashlib
from datetime import datetime, timezone
from typing import Optional
import feedparser
import httpx
from supabase import create_client
from dotenv import load_dotenv

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

load_dotenv("web/.env.local")

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise SystemExit(
        "ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.\n"
        "In GitHub Actions: add them under Settings → Secrets → Actions.\n"
        "Locally: add them to web/.env.local."
    )

# ─── RSS feeds ────────────────────────────────────────────────────────────────
RSS_FEEDS = [
    {
        "name": "The Hindu — Karnataka",
        "url": "https://www.thehindu.com/news/national/karnataka/feeder/default.rss",
    },
    {
        "name": "The Hindu — Technology",
        "url": "https://www.thehindu.com/sci-tech/technology/feeder/default.rss",
    },
    {
        "name": "Deccan Herald",
        "url": "https://www.deccanherald.com/feed",
    },
    {
        "name": "NDTV — India",
        "url": "https://feeds.feedburner.com/ndtvnews-india-news",
    },
    {
        "name": "Scroll.in",
        "url": "https://scroll.in/feed",
    },
    {
        "name": "Economic Times — Tech",
        "url": "https://economictimes.indiatimes.com/tech/rss.cms",
    },
]

# ─── Keyword filters ──────────────────────────────────────────────────────────
# Only filter for Karnataka/Bengaluru mentions — Groq handles relevance judgement.
KARNATAKA_KEYWORDS = [
    "karnataka", "bengaluru", "bangalore", "siddaramaiah", "shivakumar",
    "itbt", "k-tech", "nasscom karnataka", "iit bangalore", "iimb",
]


def mentions_karnataka(title: str, summary: str) -> bool:
    text = (title + " " + summary).lower()
    return any(k in text for k in KARNATAKA_KEYWORDS)


def parse_date(entry) -> str:
    if hasattr(entry, "published_parsed") and entry.published_parsed:
        return datetime(*entry.published_parsed[:6], tzinfo=timezone.utc).isoformat()
    return datetime.now(timezone.utc).isoformat()


def url_fingerprint(url: str) -> str:
    return hashlib.md5(url.encode()).hexdigest()


def already_exists(db, url: str) -> bool:
    res = db.from_("evidence").select("id").eq("source_url", url).limit(1).execute()
    return bool(res.data)


def match_promise_with_groq(promises: list[dict], article_title: str, article_summary: str) -> Optional[str]:
    """
    Use Llama 3.1 8B to decide:
    1. Is this article relevant to Karnataka AI/tech policy at all?
    2. If yes, which tracked promise does it relate to?
    Returns a promise ID or None.
    """
    if not GROQ_AVAILABLE or not GROQ_API_KEY:
        return None

    client = Groq(api_key=GROQ_API_KEY)
    promise_list = "\n".join(
        f"[{p['id']}] {p['text'][:120]}" for p in promises
    )

    prompt = f"""You are an AI policy analyst reviewing news articles about Karnataka, India.

Article title: {article_title}
Article summary: {article_summary[:500]}

Tracked Karnataka government AI promises:
{promise_list}

Task: Does this article provide evidence about any of the above promises — such as progress, delays, budget allocation, procurement, or contradictions?

If yes: reply with ONLY the promise ID (UUID) of the most relevant promise.
If no: reply with ONLY the word NONE.

Do not explain. One word or UUID only."""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=60,
            temperature=0,
        )
        result = response.choices[0].message.content.strip()
        if result == "NONE" or len(result) < 10:
            return None
        known_ids = {p["id"] for p in promises}
        return result if result in known_ids else None
    except Exception as e:
        print(f"    Groq matching failed: {e}")
        return None


def match_promise_keyword(promises: list[dict], title: str, summary: str) -> Optional[str]:
    """Fallback: keyword overlap matching."""
    text = (title + " " + summary).lower()
    best_id = None
    best_score = 1  # require at least 2 matching words

    for p in promises:
        words = [w for w in p["text"].lower().split() if len(w) > 5]
        score = sum(1 for w in words if w in text)
        if score > best_score:
            best_score = score
            best_id = p["id"]

    return best_id


def run():
    db = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Load all promises once
    promises_res = db.from_("promises").select("id, text, state_id").execute()
    promises = promises_res.data or []

    if not promises:
        print("No promises found in database. Exiting.")
        return

    inserted = 0
    skipped_irrelevant = 0
    skipped_duplicate = 0

    for feed_meta in RSS_FEEDS:
        print(f"\nFetching: {feed_meta['name']}")
        try:
            feed = feedparser.parse(feed_meta["url"])
        except Exception as e:
            print(f"  ERROR: Failed to fetch feed: {e}")
            continue

        print(f"  {len(feed.entries)} articles found in feed")

        for entry in feed.entries:
            title = entry.get("title", "")
            summary = entry.get("summary", entry.get("description", ""))
            url = entry.get("link", "")

            if not url or not title:
                continue

            if not mentions_karnataka(title, summary):
                skipped_irrelevant += 1
                continue

            print(f"  Karnataka mention — sending to Groq: {title[:70]}")

            if already_exists(db, url):
                skipped_duplicate += 1
                print(f"    → duplicate, skipped")
                continue

            # Groq decides relevance + promise match; keyword is fallback if Groq unavailable
            promise_id = match_promise_with_groq(promises, title, summary)
            if not promise_id and not GROQ_API_KEY:
                promise_id = match_promise_keyword(promises, title, summary)

            if not promise_id:
                print(f"    → no promise match, skipped")
                continue

            matched = next((p for p in promises if p["id"] == promise_id), None)
            print(f"    → matched: {matched['text'][:60] if matched else promise_id}…")

            found_at = parse_date(entry)

            db.from_("evidence").insert({
                "promise_id": promise_id,
                "type": "news_coverage",
                "source_url": url,
                "description": f"{feed_meta['name']}: {title}",
                "found_at": found_at,
                "verified_by_human": False,
            }).execute()

            inserted += 1
            print(f"    → INSERTED ✓")

    print(f"\n{'─' * 50}")
    print(f"Done. {inserted} articles inserted, {skipped_duplicate} duplicates skipped, {skipped_irrelevant} irrelevant.")


if __name__ == "__main__":
    run()
