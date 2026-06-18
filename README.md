# Payroll & Roster System

A Next.js + React + Prisma application for employee management, shift rostering, and payroll tracking.

## Local setup

1. Copy `.env.example` to `.env`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
4. Create the database and apply migrations:
   ```bash
   npm run prisma:migrate
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open `http://localhost:3000`.

## Prisma models

- `Employee`: first name, last name, email, role, hourly rate
- `Shift`: linked employee, date, start/end times, hours, notes
- `Payroll`: linked employee, pay period, gross pay, tax, net pay

## API routes

- `POST /api/employees`
- `GET /api/employees`
- `POST /api/shifts`
- `GET /api/shifts`
- `POST /api/payrolls`
- `GET /api/payrolls`

## Azure deployment

This app can be deployed to Azure App Service or Azure Static Web Apps.

### App Service

1. Create an Azure App Service with Node.js runtime.
2. Set the app setting `DATABASE_URL` to your Azure database connection string.
3. Deploy the repository.
4. Run `npm install`, `npm run prisma:generate`, and `npm run build` during deployment.

### Azure Static Web Apps

1. Create a Static Web App in Azure.
2. Set the build command to `npm run build` and the output location to `.next`.
3. Add `DATABASE_URL` in Azure environment settings.
4. The app can access the database from server-side API routes.

> If you want Azure SQL instead of SQLite, update `prisma/schema.prisma` datasource provider to `sqlserver` and set `DATABASE_URL` accordingly.
