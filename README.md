# TribeCore

**The Future of Global HR, Payroll & Employee Management**

TribeCore is a world-class HR, Payroll & Employee Management SaaS platform designed to simplify people, payroll, and compliance management for businesses globally.

## 🚀 Vision & Mission

**Vision:** To simplify people, payroll, and compliance management for businesses globally.

**Mission:** To empower SMBs and enterprises with a unified, intelligent, and compliant HR system that adapts to local regulations and scales globally.

## 📋 Features

### Core Modules

- **Employee Management**
  - Employee profiles & document storage
  - Digital onboarding/offboarding workflows
  - Employment contracts & digital signatures
  - Org chart visualization
  - Role-based access control

- **Payroll Management**
  - Automated salary computation
  - Country-specific tax & deduction calculators (UK, USA, Nigeria)
  - Payslip generation (PDF/Email)
  - Payment gateway integration (Stripe, Paystack, Wise, PayPal)
  - Statutory contributions (PAYE, NIN, NHS, Pension)

- **Leave & Attendance**
  - Leave requests & approvals workflow
  - Leave balance tracking
  - Calendar integration (Google/Outlook)
  - Clock-in/out system (mobile & web)

- **Performance Management**
  - Goal/OKR setting
  - 360° feedback system
  - Performance review templates
  - KPI tracking dashboard

- **Compliance & Localization**
  - GDPR compliance automation
  - Localized tax engines per country
  - Automated audit logs

- **Reports & Analytics**
  - Payroll summaries
  - Workforce demographics
  - Leave utilization
  - Turnover & retention rates

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- TailwindCSS
- Vite
- React Query
- Zustand (State Management)
- React Router
- Recharts (Analytics)
- Lucide React (Icons)

### Backend
- Node.js
- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- Redis
- JWT Authentication
- Passport.js

### Infrastructure
- AWS S3 (Document Storage)
- AWS Cognito / Auth0 (Authentication)
- Docker & Docker Compose
- GitHub Actions (CI/CD)

## 📦 Project Structure

```
TribeCore/
├── backend/                 # NestJS Backend API
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── common/         # Shared utilities
│   │   ├── config/         # Configuration
│   │   └── database/       # Database schemas
│   └── package.json
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── features/      # Feature modules
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   └── utils/         # Utilities
│   └── package.json
├── docker-compose.yml     # Local development setup
└── README.md
```

## 🚀 Getting Started

- Node.js 18+ and npm/yarn
- PostgreSQL 14+
- Redis
- Docker (optional, for containerized setup)

### 🚀 Quick Start

### **Automated Setup (Recommended)**

**Windows (PowerShell):**
```powershell
.\setup.ps1
```

**Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
# Configure your .env file
npm run dev
```

4. **Docker Setup (Alternative)**
```bash
docker-compose up -d
```

### Environment Variables

See `.env.example` files in both backend and frontend directories for required configuration.

## 🏗️ Development

### Backend Development
```bash
cd backend
npm run start:dev      # Start development server
npm run test           # Run tests
npm run test:e2e       # Run e2e tests
npm run build          # Build for production
```

### Frontend Development
```bash
cd frontend
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
npm run test           # Run tests
```

## 🌍 Supported Regions

**Phase 1 (MVP):**
- 🇬🇧 United Kingdom (PAYE, NHS, Pensions)
- 🇺🇸 United States (Federal + State taxes, 401K, W2/W4)
- 🇳🇬 Nigeria (PAYE, NHF, Pension, ITF)

**Future Expansion:**
- 🇨🇦 Canada
- 🇮🇳 India
- 🇿🇦 South Africa
- 🇰🇪 Kenya
- And more...

## 💰 Pricing Tiers

| Tier | Target | Monthly Fee | Features |
|------|--------|-------------|----------|
| **Starter** | 1–20 Employees | $19 | Core HR, Leave, Payroll (single region) |
| **Growth** | 21–200 Employees | $99 | Multi-user, Performance, Integrations |
| **Scale** | 201–1000 Employees | $399 | Multi-country payroll, analytics, API access |
| **Enterprise** | 1000+ | Custom | Dedicated support, SSO, Advanced Security |

## 🔒 Security & Compliance

- **GDPR Compliant** - Data encryption, consent management, right to erasure
- **SOC2 Type II Ready** - Comprehensive logging and monitoring
- **Data Encryption** - AES-256 at rest, TLS 1.3 in transit
- **Multi-Factor Authentication (MFA)**
- **Role-Based Access Control (RBAC)**
- **Audit Logs** - Complete activity tracking

## 📊 Success Metrics (KPIs)

- 1,000 companies onboarded in first year
- 95% customer satisfaction (CSAT)
- Payroll processing <5 mins per company
- 99.9% uptime
- 70% renewal rate after year 1

## 🎨 Branding

**Tagline:** "Powering People. Simplifying Payroll."

**Design:** Clean, minimalist, accessible (WCAG 2.1)

**Colors:** Blue (trust), Green (growth), White (simplicity)

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

Copyright © 2025 TribeCore. All rights reserved.

## 📞 Support

For support, email support@tribecore.com or visit our documentation at docs.tribecore.com

---

**TribeCore** - The Global Standard for HR, Payroll & Compliance Management
