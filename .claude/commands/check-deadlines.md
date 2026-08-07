---
description: Focused deadline pass — verify only TBA venues and venues close to their deadline (catches extensions). Cheaper than the full monthly /update-deadlines.
allowed-tools: Bash, Read, Edit, Write, Glob, Grep, WebSearch, WebFetch
---

You are performing the **focused** deadline-maintenance pass on the ai-deadlines
dataset. This is deliberately narrower than `/update-deadlines`: it only touches
venues that are **TBA** or **close to their deadline**, and it does **not**
discover brand-new editions (that stays the job of the monthly `/update-deadlines`).

Read `.claude/CLAUDE.md` first — its conventions are binding (deadline quoting,
the no-bare-`": "` rule in notes, the `Predicted` note format, the year N+1 rule).
Today's date from the environment is "now". Work only in `_data/conferences/*.yml`.

## 0. Gate — decide whether to run at all

```bash
python utils/find_venues_to_check.py --gate
```
- Exit code **10 (SKIP)**: stop immediately. Make no edits. Report the single
  line the gate printed and end. Do not proceed.
- Exit code **0 (ACT)**: continue.

The gate implements the cadence: a weekly baseline run, plus an every-2-days
run whenever a deadline is within one week.

## 1. Get the worklist

```bash
python utils/find_venues_to_check.py
```
This prints three buckets — **TBA venues**, **Close to deadline** venues, and
**Predicted venues whose estimated deadline is within 60 days**. These are the
*only* venues you may edit this pass.

## 2. Verify each listed venue against its official source

For every venue in the worklist:
- Open the official CFP — start from the entry's `link`; if stale, `WebSearch`
  `"<TITLE> <year> call for papers"` and `WebFetch` the official page.
- **TBA venue**: if the deadline is now published, replace `TBA` with the real
  `deadline` (+ `abstract_deadline`, `place`, `date`, `start`, `end` as
  available), rewrite the `note` to the real key dates, and update `link` to the
  year-specific URL. If still unannounced, leave it `TBA`.
- **Close-to-deadline venue (confirmed)**: check for an **extension** or change.
  If the official page now shows a later (or corrected) date, update `deadline`
  and note the extension (e.g. "deadline extended to …"). If unchanged, leave it.
- **Close-to-deadline venue (predicted)**: if official dates are now out,
  **promote** it — set the real dates and drop the word `Predicted` from the
  note. If still unannounced this close, leave it predicted.
- **Predicted venue within 60 days**: the estimated deadline is approaching, so
  the official CFP may now exist. If it does, **promote** — set the real
  `deadline`, `abstract_deadline`, `place`, `date`, `start`, `end`, `link`, and
  drop `Predicted` from the note. If still unannounced, **re-estimate**: keep it
  `Predicted` but refresh the estimate and the "past deadlines — …" list.

## Rules
- **Never fabricate.** Every date is either sourced from an official page (cited
  in the `note` via `More info <a …>here</a>`) or stays `Predicted`/`TBA`.
- **Smallest diff** — touch only fields that actually changed; do not reformat or
  reorder untouched entries.
- Do not add new editions or run `find_missing_conferences.py` — out of scope here.

## Validate (must pass before finishing)
```bash
ruby -ryaml -rdate -e 'Dir.glob("_data/conferences/*.yml").each{|f| YAML.safe_load(File.read(f),permitted_classes:[Date]) }; puts "YAML OK"'
bundle exec jekyll build
```

## Report
End with a concise summary:
- **Extended/updated**: venue, old → new deadline, source URL.
- **Promoted / resolved**: TBA or predicted → confirmed, with dates + source.
- **Checked, no change**: list of venues verified as still accurate.
- **Needs human review**: anything ambiguous or conflicting.

The git commit / PR is handled by the calling routine or workflow; you only edit
files and produce this summary. If the gate said SKIP, or nothing needed
changing, say so explicitly and make no edits.
