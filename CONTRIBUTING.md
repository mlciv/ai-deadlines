# Contributing to AI Deadlines

Thanks for helping keep AI Deadlines accurate! 🎉 This site is community-maintained,
and **every deadline you add or correct helps thousands of researchers** not miss a
submission. Contributions of all sizes are welcome — from fixing a single date to
adding a whole new conference.

You do **not** need to be a programmer. If you can fill in a few fields of text,
you can contribute. The steps below look long only because they're thorough — a
typical edit takes about two minutes.

---

## What you can contribute

- ⏰ **Update a deadline** that changed or was extended.
- 🆕 **Add a new edition** of a conference (e.g. next year's).
- 🌍 **Fix details** — location, dates, a broken link, a typo.
- 🐛 **Report a problem** without fixing it — just [open an issue](../../issues/new)
  and tell us what's wrong. That's a valuable contribution too.

We list **top-tier AI/ML/CV/NLP/Robotics/Speech venues**. If you're unsure whether
a venue fits, open an issue and ask — we're happy to help.

---

## The easy way: edit in your browser (no local setup)

You don't need to install anything or use the command line. GitHub will make your
own copy ("fork") automatically when you edit.

1. Open the file for the venue in [`_data/conferences/`](_data/conferences) —
   for example `emnlp.yml`. (New venue? See [Adding a new conference](#adding-a-new-conference).)
2. Click the **✏️ pencil icon** ("Edit this file"). GitHub forks the repo for you.
3. Make your change (copy the [template](#the-entry-format) below).
4. Scroll down, click **Propose changes**, then **Create pull request**.
5. Done! A maintainer will review it. If something needs tweaking, we'll comment —
   no worries if it's not perfect the first time.

Prefer the command line? Fork → clone → branch → edit → push → open a PR as usual.

---

## Where the data lives

- All deadlines live in **`_data/conferences/`**, with **one `.yml` file per venue**
  (`cvpr.yml`, `emnlp.yml`, …). The website, the calendar, and the JSON API are all
  generated from these files — you only ever edit the YAML.
- Each file is a **list of editions, newest first**. One list item = one conference
  edition (one year). To add next year's deadline, add a new item at the **top**.

---

## The entry format

Copy this template and fill it in:

```yaml
- title: EMNLP                       # short name, as shown on the card
  year: 2026                         # the conference year
  id: emnlp26                        # title lowercased + last two digits of year
  full_name: Conference on Empirical Methods in Natural Language Processing  # optional
  link: https://2026.emnlp.org/      # official conference website
  deadline: '2026-05-25 23:59:00'    # submission deadline — QUOTE IT (see rules)
  abstract_deadline: '2026-05-18 23:59:00'  # optional, if there's a separate abstract deadline
  timezone: UTC-12                   # AoE deadlines use UTC-12; otherwise a moment-timezone name
  place: Suzhou, China               # City, Country (or City, State, USA); TBA if unannounced
  date: November 5-9, 2026           # human-readable conference dates
  start: '2026-11-05'                # optional, machine-readable start (quote it)
  end: '2026-11-09'                  # optional, machine-readable end (quote it)
  sub:                               # subject tag(s) — see _data/types.yml
  - NLP
  note: All submissions via ARR. More info <a href='https://2026.emnlp.org/'>here</a>.  # optional
```

### Field reference

| Field | Required | Notes |
|-------|:--------:|-------|
| `title` | ✅ | Short venue name shown on the card. |
| `year` | ✅ | Conference year (the year it's held). |
| `id` | ✅ | `title` lowercased + last two digits of year, e.g. `cvpr27`. Must be unique. |
| `link` | ✅ | Official conference URL (year-specific if possible). |
| `deadline` | ✅ | Paper submission deadline, **quoted** (`'YYYY-MM-DD HH:MM:SS'`), or the literal `TBA`. |
| `timezone` | ✅ | `UTC-12` for AoE, else a [moment-timezone](https://momentjs.com/timezone/) name like `America/New_York`. |
| `date` | ✅ | Human-readable conference dates, e.g. `November 5-9, 2026`. |
| `place` | ✅ | `City, Country` (or `City, State, USA`). Use `TBA` if not yet announced. |
| `sub` | ✅ | One or more subject tags from [`_data/types.yml`](_data/types.yml) (`ML`, `CV`, `NLP`, `RO`, `SP`, `DM`, …). |
| `abstract_deadline` | ➖ | If the venue has a separate mandatory abstract deadline. Quote it. |
| `start` / `end` | ➖ | Machine-readable conference start/end (`'YYYY-MM-DD'`, quoted). |
| `full_name` | ➖ | Full conference name. |
| `note` | ➖ | Short free-text note; may include a link (see rules). |
| `hindex` | ➖ | Google Scholar h5-index, if known. |
| `paperslink` / `pwclink` | ➖ | Link to the proceedings / Papers-with-Code page. |

---

## A few rules that matter

Most edits are simple, but these are the things that trip people up:

1. **Quote the dates.** Always wrap `deadline`, `start`, and `end` in single quotes
   so YAML keeps them as text: `deadline: '2026-05-25 23:59:00'`. An unquoted date
   can be misparsed.

2. **Unknown deadline → the literal `TBA`** (not a guess): `deadline: TBA`.

3. **"Anywhere on Earth" (AoE) → `timezone: UTC-12`.** That's how AoE is represented here.

4. **Watch the `note` field.** It's plain text (not quoted), so **never put a bare
   colon-space (`": "`) inside it** — it breaks the YAML parser. Use an em dash or a
   comma instead. Links are fine: `More info <a href='https://...'>here</a>.`

5. **Estimating a future deadline?** If there's no official Call for Papers yet and
   you're extrapolating from past years, start the `note` with the word **`Predicted`**
   and say what it's based on, e.g.:
   `Predicted deadline based on historical CVPR pattern (past deadlines — 2025 Nov 13, 2024 Nov 15). Please verify on the official website.`
   The card shows predicted entries with a distinct style so readers know.

6. **One year at a time.** Please don't add year *N+1* until year *N* already has a
   **confirmed** (non-`TBA`, non-predicted) deadline.

7. **Never invent a date.** Either cite an official source (put the link in the `note`)
   or clearly mark it `Predicted` with its historical basis. When in doubt, `TBA` is
   the honest choice.

---

## Full examples

**A confirmed edition** (official CFP is out):

```yaml
- title: CVPR
  year: 2026
  id: cvpr26
  link: https://cvpr.thecvf.com/Conferences/2026
  deadline: '2025-11-14 23:59:00'
  timezone: UTC-12
  place: Denver, Colorado, USA
  date: June 17-21, 2026
  start: '2026-06-17'
  end: '2026-06-21'
  sub:
  - CV
  note: Mandatory abstract deadline November 7, 2025. More info <a href='https://cvpr.thecvf.com/Conferences/2026'>here</a>.
```

**A predicted edition** (no official CFP yet — note starts with `Predicted`):

```yaml
- title: CVPR
  year: 2027
  id: cvpr27
  link: https://cvpr.thecvf.com/Conferences/2027
  deadline: '2026-11-13 23:59:00'
  timezone: UTC-12
  place: Seattle, Washington, USA
  date: June 20-24, 2027
  start: '2027-06-20'
  end: '2027-06-24'
  sub:
  - CV
  note: Predicted deadline based on historical CVPR pattern (past deadlines — 2025 Nov 13, 2024 Nov 15, 2023 Nov 17). Please verify on the official website. More info <a href='https://cvpr.thecvf.com/Conferences/2027'>here</a>.
```

---

## Adding a new conference

If the venue has **no file yet** in `_data/conferences/`:

1. Create a new file named after the venue, lowercase, e.g. `neurips.yml`.
2. Add a single list item using the [template](#the-entry-format) above.
3. Make sure the `sub` tag(s) exist in [`_data/types.yml`](_data/types.yml) — if your
   field isn't listed, mention it in your PR and we'll sort it out.

---

## Before you submit (optional, but appreciated)

Your edit doesn't have to be verified locally — a maintainer will check it. But if you
have Ruby installed and want to be sure your YAML is valid:

```bash
# 1. Every data file must parse
ruby -ryaml -rdate -e 'Dir.glob("_data/conferences/*.yml").each{|f| YAML.safe_load(File.read(f),permitted_classes:[Date]) }; puts "YAML OK"'

# 2. (optional) The whole site should build
bundle exec jekyll build
```

If step 1 prints `YAML OK`, your change is well-formed.

---

## Opening a good pull request

- **Cite your source.** A link to the official CFP or announcement (in the PR
  description or the `note`) makes review fast.
- **One venue per PR** when you can — it's easier to review and merge.
- **Keep the diff small** — change only the fields that actually changed; please don't
  reformat or reorder unrelated entries.
- A friendly PR title like `Update EMNLP 2026 deadline (extended)` helps a lot.

That's it. Thank you for contributing — you're helping the whole community stay on
top of deadlines. 💜

Questions? [Open an issue](../../issues/new) and we'll help you through it.
