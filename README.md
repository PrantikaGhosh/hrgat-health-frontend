# HRGAT-Health Frontend

React dashboard for **HRGAT-Health**, a referral-network-aware hospital capacity forecasting system. It shows live ICU and general bed occupancy for 369 Texas hospitals, lets staff admit, discharge and transfer patients, and shows the STGAT next-week forecast for each hospital.

The backend lives in [hrgat-health-backend](https://github.com/PrantikaGhosh/hrgat-health-backend).

## Features

- **Dashboard**: system-wide occupancy and capacity of all 24 referral regions, sortable by ICU or general beds
- **Hospital list** with search and capacity badges
- **Hospital detail**: live occupancy, occupancy history with the STGAT forecast, current patients and the referral network
- **Patient actions**: admit, discharge and transfer, with the chart updating right after each action
- **Smart transfers**: suggests hospitals in the same referral region with free beds, then asks for the unit
- **Team page** (admins only): add, edit and remove admin and staff accounts
- **Passwordless login** with e-mail OTP

## Tech stack

React 18, Vite, React Router, Axios, Recharts, Tailwind CSS, Framer Motion, Lucide icons

## Setup

### Prerequisites

- Node.js 18 or newer
- The backend running (default `http://127.0.0.1:8000`)

### Install and configure

```bash
npm install
cp .env.example .env
```

`.env` holds the backend address:

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### Run

Start the backend first (`uvicorn app.main:app --reload` in the backend folder), then:

```bash
npm run dev
```

Open `http://localhost:5173`.

### Build

```bash
npm run build
npm run preview
```

## Project structure

```
src/
├── api/          # Axios client and API calls
├── components/   # Layout, route guards, occupancy chart, shared UI
├── context/      # auth and toast providers
├── pages/        # Login, Dashboard, Hospitals, HospitalDetail, AdminUsers
├── App.jsx       # routes
└── main.jsx      # entry point
```

## How it works

- **Session**: after login, `user_id`, `email`, `auth_token`, `role` and `hospital_id` are stored in `localStorage` under `hrgat_auth`, so a page refresh keeps you logged in.
- **401**: an invalid or expired token clears the session and returns you to the login page.
- **403**: an action your role cannot do shows an error message without logging you out.
- **Roles**: admins see the Team page and manage accounts and hospitals. Staff can act only on patients of their own hospital.
- **Forecast**: the chart shows the real weekly history and the next-week STGAT forecast. Dates are shifted so the latest data week appears as the current week, and the forecast uses the live patient count of the hospital you are viewing.

## Team

Prantika Ghosh, Pijush Banerjee, Rishita Paul, Priyanshu Ghosh, Veerat Pandey

Under the guidance of Prof. (Dr.) Sudipta Sahana, Department of CSE (AI & ML), University of Engineering and Management, Kolkata.
