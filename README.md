# Bank Campaign Insights

A fullstack web application for analyzing and visualizing bank marketing campaign data, with predictive modeling and role-based access control.

## Overview

Built around the [UCI Bank Marketing dataset](https://archive.ics.uci.edu/ml/datasets/Bank+Marketing), this system enables data analysts and managers to:

- Upload and validate campaign CSV files
- Explore data through interactive dashboards and charts
- Apply dynamic filters to segment results
- Predict client subscription probability using logistic regression
- Export reports in PDF or Excel format
- Manage users and permissions by role

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite, React Router v7, Recharts, Victory, MUI |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| File handling | Multer, csv-parser |
| Exports | PDFKit, ExcelJS |

## Project Structure

```
bank-campaign-insights/
├── client/               # React frontend (Vite)
│   └── src/
│       ├── components/   # Reusable UI components and charts
│       ├── context/      # FilterContext, ToastContext, DashboardDataContext
│       ├── hooks/        # useAccessControl, useDashboardData, useFileUpload, etc.
│       └── pages/        # Login, DataLoad, Dashboard, Prediction, UserManagement, etc.
├── server/               # Express backend
│   └── src/
│       ├── controllers/  # HTTP layer
│       ├── services/     # Business logic (metrics, prediction, reports, RBAC)
│       ├── daos/         # Data access layer
│       ├── models/       # Mongoose schemas
│       ├── routes/       # Route definitions
│       ├── middleware/   # Auth, RBAC, error handling
│       └── utils/        # CSV validators (structure, quality, business rules)
└── docs/                 # Dataset, SRS, class diagram, and project brief
```

## Architecture

- **Backend**: MVC pattern with a service layer and DAO abstraction over MongoDB.
- **Prediction**: Strategy + Template Method patterns for logistic regression inference. Supports manager-configurable interpretation thresholds via a Decorator.
- **Reports**: Factory pattern to produce PDF or Excel exports from the same data pipeline.
- **Access control**: RBAC enforced at both the API middleware level and UI route level. Two roles: `manager` and `analyst`.
- **CSV validation**: Three-stage validation pipeline — structural, data quality, and business rules.

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB instance (local or Atlas)

### Backend

```bash
cd server
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, PORT
npm install
npm run dev
```

### Frontend

```bash
cd client
cp .env.example .env   # set VITE_API_URL
npm install
npm run dev
```

The client runs on `http://localhost:5173` and the server on the port defined in `.env` (default `3000`).

## Documentation

See [`docs/`](docs/) for:

- `SRS_Campañas_Bancarias_para_proyecto_de_Diseño_IIS_2025.pdf` — Software Requirements Specification
- `IC Primer Proyecto de Diseño de Software IIS 2025.pdf` — Project brief
- `ClassDiagram.png` — UML class diagram
- `bank-additional-full.csv` — Source dataset

## License

See [LICENSE](LICENSE).
