<div align="center">

# SSG TMS React Excel

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-6-0170FE?logo=antdesign&logoColor=white)](https://ant.design/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**A React-based Training Management System for SSG/WSG API integration with Excel bulk upload support**

[Report Bug](https://github.com/alfredang/ssg-tms-react-excel/issues) · [Request Feature](https://github.com/alfredang/ssg-tms-react-excel/issues)

</div>

---

## About

SSG TMS React Excel is a web application that integrates with SkillsFuture Singapore (SSG) and Workforce Singapore (WSG) APIs, enabling training providers to manage course runs, sessions, trainers, enrolments, assessments, and skills framework data through a unified dashboard.

The app supports **bulk operations via Excel file upload** (`.xlsx`), with built-in validation, data preview, and direct API submission — streamlining administrative workflows for training providers.

### Key Features

- **Course Run Management** — Publish, edit, delete, and view course runs with sessions and trainers
- **Trainer Management** — Full CRUD for training provider trainer profiles
- **Enrolment Lifecycle** — Create, update, cancel, search, and manage fee collections
- **Assessment Management** — Create, update, void, search, and view assessments
- **Skills Framework** — Browse occupations, search job roles, and explore skills
- **Excel Bulk Upload** — Upload `.xlsx` files with multi-sheet support, field validation, and data preview before submission
- **Centralized API Layer** — Axios client with interceptors for auth, error handling, and logging

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript 5 |
| **Build Tool** | Vite 7 |
| **UI Library** | Ant Design 6, Ant Design Icons |
| **HTTP Client** | Axios |
| **Excel Parsing** | SheetJS (xlsx) |
| **Routing** | React Router v7 |
| **Date Handling** | Day.js |
| **API Integration** | SSG/WSG REST APIs (mTLS + encrypted payloads) |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser UI                     │
│  ┌───────────┐ ┌──────────┐ ┌────────────────┐  │
│  │ Dashboard  │ │  Pages   │ │  Excel Upload  │  │
│  │           │ │ (7 modules)│ │  + Preview     │  │
│  └───────────┘ └──────────┘ └────────────────┘  │
├─────────────────────────────────────────────────┤
│                 React Hooks                      │
│         useApi() · useExcelUpload()              │
├─────────────────────────────────────────────────┤
│              API Service Layer                   │
│  courseService · trainerService · enrolmentService│
│  assessmentService · skillsService               │
├─────────────────────────────────────────────────┤
│            Axios Client (ssgClient)              │
│    Auth Headers · Error Handling · Logging        │
├─────────────────────────────────────────────────┤
│           SSG/WSG REST APIs (mTLS)               │
│  UAT: uat-api.ssg-wsg.sg                        │
│  Prod: api.ssg-wsg.sg                           │
└─────────────────────────────────────────────────┘
```

---

## Project Structure

```
ssg-tms-react-excel/
├── src/
│   ├── api/                     # Centralized API service layer
│   │   ├── ssgClient.ts         # Axios instance + interceptors
│   │   ├── courseService.ts     # Course Runs & Sessions endpoints
│   │   ├── trainerService.ts   # Trainer CRUD endpoints
│   │   ├── enrolmentService.ts # Enrolment lifecycle endpoints
│   │   ├── assessmentService.ts # Assessment lifecycle endpoints
│   │   └── skillsService.ts    # Skills Framework endpoints
│   ├── components/
│   │   ├── AppLayout.tsx        # Sider + Content layout
│   │   ├── ExcelUpload.tsx      # Upload + preview modal
│   │   ├── DataPreview.tsx      # Table with error highlighting
│   │   └── PageHeader.tsx       # Breadcrumbs + title
│   ├── pages/
│   │   ├── Dashboard.tsx        # Module navigation
│   │   ├── CourseSessions.tsx   # Session retrieval + upload
│   │   ├── CourseRuns.tsx       # View/Add/Edit/Delete tabs
│   │   ├── Trainers.tsx        # Retrieve/Add/Update/Delete
│   │   ├── Enrolments.tsx      # Full enrolment lifecycle
│   │   ├── Assessments.tsx     # Full assessment lifecycle
│   │   └── SkillsFramework.tsx # Occupation & job role browser
│   ├── hooks/
│   │   ├── useApi.ts            # API state management
│   │   └── useExcelUpload.ts   # Excel file handling
│   ├── utils/
│   │   ├── excelParser.ts      # SheetJS parsing + mapping
│   │   └── validators.ts      # Schema validation
│   ├── types/
│   │   └── index.ts            # TypeScript types + enums
│   ├── App.tsx                  # Router + theme config
│   └── main.tsx                 # Entry point
├── .env.example                 # Environment variable template
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **SSG Developer Portal** account with API credentials ([developer.ssg-wsg.gov.sg](https://developer.ssg-wsg.gov.sg))
- Client certificate (`.pem`) and private key for mTLS authentication

### Installation

```bash
# Clone the repository
git clone https://github.com/alfredang/ssg-tms-react-excel.git
cd ssg-tms-react-excel

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your SSG API credentials
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SSG_API_BASE_URL` | SSG API base URL (UAT or Production) |
| `VITE_SSG_CLIENT_ID` | OAuth Client ID |
| `VITE_SSG_CLIENT_SECRET` | OAuth Client Secret |
| `VITE_SSG_UEN` | Training Provider UEN |

### Running

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---

## SSG API Endpoints

All endpoints are verified from [SSG's official Sample-Codes repository](https://github.com/ssg-wsg/Sample-Codes).

| Module | Endpoint | Method |
|--------|----------|--------|
| **Course Runs** | `/courses/courseRuns/id/{runId}` | GET |
| | `/courses/courseRuns/publish` | POST |
| | `/courses/courseRuns/edit/{runId}` | POST |
| **Sessions** | `/courses/runs/{runId}/sessions` | GET |
| **Trainers** | `/tp/trainers` | GET/POST |
| **Enrolments** | `/tpg/enrolments` | POST |
| | `/tpg/enrolments/details/{refNum}` | GET/POST |
| | `/tpg/enrolments/search` | POST |
| | `/tpg/enrolments/feeCollections/{refNum}` | POST |
| **Assessments** | `/tpg/assessments` | POST |
| | `/tpg/assessments/details/{refNum}` | GET/POST |
| | `/tpg/assessments/search` | POST |
| **Skills** | `/skillsFramework/occupations` | GET |
| | `/skillsFramework/jobRoles` | GET |

---

## Excel Upload Format

The app supports `.xlsx` files with the following sheet structures:

### Course Sessions Sheet
| Column | Required | Description |
|--------|----------|-------------|
| Start Date | Yes | Session start date |
| End Date | Yes | Session end date |
| Start Time | Yes | HH:mm format |
| End Time | Yes | HH:mm format |
| Mode of Training | Yes | Training mode code |

### Enrolments Sheet
| Column | Required | Description |
|--------|----------|-------------|
| Course Run ID | Yes | Target course run |
| Course Reference Number | Yes | SSG course reference |
| Trainee ID | Yes | NRIC/FIN |
| Trainee ID Type | Yes | SB/SO/OT |
| Trainee Full Name | Yes | Legal full name |
| Enrolment Date | Yes | Date of enrolment |
| Sponsorship Type | Yes | EMPLOYER/INDIVIDUAL |
| Training Partner Code | Yes | TP code |

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Acknowledgements

- [SSG Developer Portal](https://developer.ssg-wsg.gov.sg) — Official API documentation
- [SSG Sample Codes](https://github.com/ssg-wsg/Sample-Codes) — Reference implementation
- [Ant Design](https://ant.design/) — UI component library
- [SheetJS](https://sheetjs.com/) — Excel parsing library

---

<div align="center">

**If you found this useful, give it a star!**

</div>
