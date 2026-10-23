# Bytecore Computer — Coaching & Alumni Platform

A management platform for a computer coaching institute (Nariyawal & Thiriya centres): student records, fee tracking, certificates, quizzes, and an admin dashboard, backed by Firebase and synced from Google Sheets.

## Tech Stack

- **Frontend:** React 19 + Vite, Tailwind CSS, Framer Motion
- **Backend/Data:** Firebase (Auth, Firestore, Storage, Messaging), Supabase (image hosting)
- **Payments:** Razorpay (server-side order creation & signature verification via Vercel API routes)
- **Data sync:** Google Sheets → Firestore, for live student/fee data per centre

## Getting Started

```bash
npm install
npm run dev       # start local dev server
npm run build     # production build
```

Copy `.env.example` (if present) or set the following environment variables before running:

- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`
- `VITE_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- Any Supabase / Google Sheets credentials used by `src/lib/`

## Project Structure

```
src/
  app/            Redux store, auth context, route guards
  components/     Shared UI components
  pages/          Route-level pages (CoachingAdmin, StudentPortal, etc.)
  lib/            Firestore helpers, image handling, Google Sheets sync
  services/       Cross-centre student lookup/sync logic
  firebase/       Firebase app initialization
api/              Vercel serverless functions (Razorpay order + verification, student login)
```

## Notes

- Student login is registration number + mobile based (no password) and is rate-limited server-side.
- The admin student list loads once per session (not a live listener) and updates optimistically after edits, to keep the dashboard fast even with a large student count.
- Firestore security rules restrict client-side writes to a narrow allow-list of fields; bulk data changes go through the Google Sheets sync or the admin panel.


## Fees / Google Sheet (what changed)
- `/student-login`: Roll No. **or** Mobile (either works), both centres, data straight from the Google Sheets. Name picker if a number is shared.
- `/admin/fees`: fast live fee table (admin's existing Firebase login). Button "Sync to app now" pushes changed students to Firestore.
- `/api/sync` (optional, see `apps-script/Code.gs` + `SYNC_SECRET`): sheet edit -> only changed students written to Firestore -> StudentPortal updates live.
- Needs the same Firebase Admin env the project already uses (`FIREBASE_SERVICE_ACCOUNT` or `VITE_FIREBASE_*`).

## If login ever fails
Open `https://YOUR-SITE/api/health` — it tests library loading, Firebase Admin credentials, Firestore, login-token creation and both Google Sheets, and shows which step failed.
Every login error is JSON with a `code` (shown small under the error on the login page).
