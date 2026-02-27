# J-management-app (MVP)

## Data source (current)
- MVP phase uses Google Sheets **public CSV** (A mode).
- Pages fetch CSV directly on the server:
  - /members -> SHEETS_MEMBERS_CSV_URL
  - /goals   -> SHEETS_GOALS_CSV_URL
  - /links   -> SHEETS_LINKS_CSV_URL
  - /org     -> SHEETS_MEMBERS_CSV_URL (parent_id tree)

## Environment Variables (Vercel)
- BASIC_AUTH_USER
- BASIC_AUTH_PASS
- SHEETS_MEMBERS_CSV_URL
- SHEETS_GOALS_CSV_URL
- SHEETS_LINKS_CSV_URL

## Notes
- /api/* routes may exist, but pages do not depend on them in A mode.
- Future plan (B mode): move to Google Sheets API (service account) and/or unify via internal API routes.