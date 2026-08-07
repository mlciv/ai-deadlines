#!/usr/bin/env python3
"""
Worklist for the *focused* deadline-maintenance pass.

Unlike find_missing_conferences.py (which hunts for brand-new editions), this
script emits only the venues worth re-checking *right now*, in two buckets:

  1. TBA        - a future edition whose `deadline` is the literal `TBA`.
                  We don't know when it is, so it must be checked every pass.
  2. CLOSE      - an edition whose concrete `deadline` falls inside a window
                  around today (default: 7 days back .. 21 days ahead).
                  This is where extensions and last-minute changes happen; the
                  small look-back catches deadlines that just passed but may
                  have been extended.

Predicted entries with a far-future estimated date are deliberately *skipped*
until they enter the CLOSE window - that keeps each pass cheap.

Usage:
  python utils/find_venues_to_check.py               # human-readable
  python utils/find_venues_to_check.py --json        # machine-readable
  python utils/find_venues_to_check.py --days-ahead 30 --days-behind 10
"""

import argparse
import glob
import json
import os
import sys
from datetime import datetime, timedelta

import yaml

CONF_DIR = os.path.join(os.path.dirname(__file__), "..", "_data", "conferences")


def parse_deadline(value):
    """Return a datetime for a concrete deadline, or None for TBA/unparseable."""
    if value is None:
        return None
    # Unquoted YAML dates load as datetime already.
    if isinstance(value, datetime):
        return value
    s = str(value).strip()
    if not s or s.upper() == "TBA":
        return None
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%d"):
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            continue
    return None


def is_tba(value):
    return value is not None and str(value).strip().upper() == "TBA"


def collect(days_ahead, days_behind, predicted_days):
    now = datetime.now()
    lo, hi = now - timedelta(days=days_behind), now + timedelta(days=days_ahead)
    pred_hi = now + timedelta(days=predicted_days)
    current_year = now.year

    tba, close, predicted = [], [], []
    for path in sorted(glob.glob(os.path.join(CONF_DIR, "*.yml"))):
        try:
            entries = yaml.safe_load(open(path, encoding="utf-8"))
        except Exception as e:  # noqa: BLE001 - report and move on
            print(f"# skip {path}: {e}")
            continue
        if not isinstance(entries, list):
            continue
        for e in entries:
            if not isinstance(e, dict) or not e.get("id"):
                continue
            rec = {
                "file": os.path.basename(path),
                "id": e.get("id"),
                "title": e.get("title"),
                "year": e.get("year"),
                "deadline": e.get("deadline"),
                "link": e.get("link"),
                "predicted": str(e.get("note", "")).lstrip().startswith("Predicted"),
            }
            dl = e.get("deadline")
            if is_tba(dl):
                # Only future/current editions - stale TBAs are the monthly
                # comprehensive pass's job, not this one.
                if isinstance(e.get("year"), int) and e["year"] >= current_year:
                    rec["reason"] = "deadline is TBA"
                    tba.append(rec)
                continue
            dt = parse_deadline(dl)
            if not dt:
                continue
            if lo <= dt <= hi:
                delta = (dt - now).days
                when = f"in {delta}d" if delta >= 0 else f"{-delta}d ago"
                rec["reason"] = f"deadline {when}" + (" (predicted)" if rec["predicted"] else "")
                close.append(rec)
            elif rec["predicted"] and hi < dt <= pred_hi:
                # Estimated deadline still weeks out but inside the predicted
                # look-ahead - the official CFP may now be published.
                rec["reason"] = f"predicted deadline in {(dt - now).days}d — verify for official CFP"
                predicted.append(rec)

    close.sort(key=lambda r: parse_deadline(r["deadline"]) or now)
    predicted.sort(key=lambda r: parse_deadline(r["deadline"]) or now)
    return {"tba": tba, "close": close, "predicted": predicted,
            "window": {"back_days": days_behind, "ahead_days": days_ahead,
                       "predicted_days": predicted_days}}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--days-ahead", type=int, default=21)
    ap.add_argument("--days-behind", type=int, default=7)
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--gate", action="store_true",
                    help="Decide whether the routine should act now. "
                         "Exit 0 = act, exit 10 = skip. Implements: weekly "
                         "baseline, plus every-2-days when a deadline is <1 week away.")
    ap.add_argument("--anchor-weekday", type=int, default=1,
                    help="ISO weekday for the weekly baseline run (1=Mon).")
    ap.add_argument("--urgent-days", type=int, default=7,
                    help="A deadline within +/- this many days triggers the "
                         "faster every-2-days cadence.")
    ap.add_argument("--predicted-days", type=int, default=60,
                    help="Also check predicted (estimated) entries whose "
                         "estimated deadline is within this many days.")
    args = ap.parse_args()

    result = collect(args.days_ahead, args.days_behind, args.predicted_days)

    if args.gate:
        now = datetime.now()
        urgent = [r for r in result["close"]
                  if abs((parse_deadline(r["deadline"]) - now).days) <= args.urgent_days]
        if now.isoweekday() == args.anchor_weekday:
            print(f"ACT: weekly baseline run ({len(result['tba'])} TBA, "
                  f"{len(result['close'])} in window, "
                  f"{len(result['predicted'])} predicted <{args.predicted_days}d).")
            sys.exit(0)
        if urgent and now.toordinal() % 2 == 0:
            print(f"ACT: {len(urgent)} deadline(s) within {args.urgent_days}d "
                  f"(every-2-days cadence).")
            sys.exit(0)
        if urgent:
            print(f"SKIP: {len(urgent)} urgent deadline(s) but today is an "
                  f"off-beat day (every-2-days cadence).")
        else:
            print("SKIP: no deadline within 1 week and not the weekly anchor day.")
        sys.exit(10)

    if args.json:
        print(json.dumps(result, indent=2, default=str))
        return

    tba, close, predicted = result["tba"], result["close"], result["predicted"]
    if not tba and not close and not predicted:
        print("Nothing to check: no TBA editions and no deadlines in the window.")
        return

    if tba:
        print(f"== TBA venues ({len(tba)}) — resolve against official CFP ==")
        for r in tba:
            print(f"  {r['title']} {r['year']}  [{r['file']}#{r['id']}]  {r['link']}")
    if close:
        w = result["window"]
        print(f"\n== Close to deadline ({len(close)}) — verify for extensions/changes "
              f"(-{w['back_days']}d..+{w['ahead_days']}d) ==")
        for r in close:
            print(f"  {r['title']} {r['year']}  {r['deadline']}  {r['reason']}")
            print(f"      [{r['file']}#{r['id']}]  {r['link']}")
    if predicted:
        w = result["window"]
        print(f"\n== Predicted, deadline within {w['predicted_days']}d ({len(predicted)}) "
              f"— check whether the official CFP is now published ==")
        for r in predicted:
            print(f"  {r['title']} {r['year']}  est. {r['deadline']}  {r['reason']}")
            print(f"      [{r['file']}#{r['id']}]  {r['link']}")


if __name__ == "__main__":
    main()
