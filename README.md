# HRGAT-Health Frontend

React + Vite dashboard for the HRGAT-Health API.

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` if your backend isn't running at the default `http://127.0.0.1:8000`.

## Run

Make sure the backend is running first (`uvicorn app.main:app --reload` from
`backend/`), then:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Notes

- **Auth**: passwordless, email + OTP. The session (`user_id`, `email`,
  `auth_token`, `role`, `hospital_id`) is persisted in `localStorage` under
  the key `hrgat_auth`, so refreshing the page doesn't require logging in
  again. A `401` response from the API (invalid/expired token) automatically
  clears local storage and redirects to `/login`. A `403` (wrong role for
  an action) does not log you out, it just shows an error message.
- **Roles**: `admin` sees the Team page and can add/edit/delete hospitals
  and accounts. `staff` sees hospitals and can admit/discharge/transfer
  patients, but not manage the team.
- **Forecast chart**: built from the trained STGAT model. Since live data
  has no historical depth yet, the forecast is computed from the most
  recent real weeks in the training data (through April 2024), not live
  occupancy, this is documented in the backend's `forecast_service.py`.
