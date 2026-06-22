# Archived conferences (not maintained)

These venues were moved out of `_data/conferences/` because they are not
top-tier / reputable enough to track. They live under `_archive/`, which Jekyll
ignores (leading `_`), so they are neither built nor published.

**Do not re-add these** (e.g. via `utils/auto_add_conferences.py`):

- `cvc.yml` — Computer Vision Conference (saiconference.com / SAI) — borderline-predatory publisher.
- `cvai.yml` — CVAI symposium — obscure, no standing.
- `icaaaaiml.yml` — ICAAAIML — generic catch-all venue, predatory profile.
- `icmla.yml` — IEEE ICMLA — low-tier.
- `icmlcn.yml` — IEEE ICMLCN — brand-new, niche (ML for communications/networking).
- `acml.yml` — ACML — minor regional ML conference.

To restore one, `git mv` it back into `_data/conferences/`.
