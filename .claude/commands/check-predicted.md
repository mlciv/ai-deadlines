---
description: Monthly full sweep of every PREDICTED (estimated) entry — verify each against its official CFP and promote/refresh. Broader than /check-deadlines.
allowed-tools: Bash, Read, Edit, Write, Glob, Grep, WebSearch, WebFetch
---

You are performing the **monthly predicted-entries sweep** on the ai-deadlines
dataset. Unlike `/check-deadlines` (which only looks at TBA, close-to-deadline,
and predicted-within-60-days venues), this pass reviews **every** predicted entry,
however far out — so an estimated deadline gets promoted to the official one as
soon as the Call for Papers appears.

Read `.claude/CLAUDE.md` first — its conventions are binding (deadline quoting,
the no-bare-`": "` rule in notes, the `Predicted` note format, the year N+1 rule).
Today's date from the environment is "now". Work only in `_data/conferences/*.yml`.

## 1. Get the worklist

```bash
python utils/find_venues_to_check.py --all-predicted
```
This lists every predicted future edition (title, year, current estimated
deadline, file/id, official link). These are the only entries you may edit.

## 2. Verify each against its official source

For every listed venue:
- Open the official CFP — start from the entry's `link`; if stale, `WebSearch`
  `"<TITLE> <year> call for papers"` and `WebFetch` the official page.
- **If the official CFP is now published** → **promote**: set the real `deadline`,
  `abstract_deadline` (if any), `place`, `date`, `start`, `end`, update `link`, and
  **remove the word `Predicted`** from the `note` (rewrite it to the real key dates).
- **If official venue/dates are out but the submission deadline is not** → correct
  `place`/`date`/`start`/`end`, but **keep the `Predicted` deadline and the
  `Predicted` note** (say the host/dates are confirmed, deadline not yet announced).
- **If still fully unannounced** → leave it. Optionally refresh the estimate and the
  "past deadlines — …" list if a newer prior-year date is available.

## Rules
- **Never fabricate.** Promote only from an official page (cite it in the `note`);
  otherwise it stays `Predicted`/`TBA`. Beware look-alike sites (e.g. a different
  conference sharing an acronym) — confirm it's the right venue.
- **Smallest diff** — change only fields that actually changed; don't reformat or
  reorder untouched entries.
- Do not add brand-new editions here — this pass only verifies existing predicted ones.

## Validate (must pass before finishing)
```bash
ruby -ryaml -rdate -e 'Dir.glob("_data/conferences/*.yml").each{|f| YAML.safe_load(File.read(f),permitted_classes:[Date]) }; puts "YAML OK"'
bundle exec jekyll build
```

## Report
End with a concise summary:
- **Promoted** (predicted → confirmed): venue, official dates, source URL.
- **Partly updated** (place/dates confirmed, deadline still predicted): venue + what changed.
- **Still predicted**: venues with no official CFP yet (brief list).
- **Needs human review**: anything ambiguous or conflicting.

The git commit / PR is handled by the calling routine. You only edit files and
produce this summary. If nothing needed changing, say so and make no edits.
