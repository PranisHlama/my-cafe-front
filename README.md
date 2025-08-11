# Cafe Manager Frontend

A modern Next.js frontend for cafe management with a comprehensive app router structure.

## Features

- **Dashboard**: Overview with key metrics and quick actions
- **Orders**: Order management and tracking
- **Menu**: Menu display and management (connected to Django backend)
- **Inventory**: Stock tracking and management
- **Reports**: Analytics and performance insights
- **Settings**: System configuration and preferences

## App Router Structure

```
app/
├── page.tsx              # Root page (redirects to dashboard)
├── layout.tsx            # Root layout with sidebar
├── dashboard/
│   └── page.tsx         # Dashboard page
├── orders/
│   └── page.tsx         # Orders management
├── menu/
│   └── page.tsx         # Menu display (from Django)
├── inventory/
│   └── page.tsx         # Inventory management
├── reports/
│   └── page.tsx         # Analytics and reports
└── settings/
    └── page.tsx         # System settings
```

## Components

- `Sidebar.tsx`: Navigation sidebar with all main routes
- `MenuDisplay.tsx`: Menu display component (connects to Django API)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Navigation

The sidebar provides easy access to all main sections:
- **Dashboard**: Overview and quick actions
- **Orders**: Manage customer orders
- **Menu**: View and manage menu items
- **Inventory**: Track supplies and stock
- **Reports**: View performance analytics
- **Settings**: Configure system preferences

## Backend Integration

The frontend is designed to work with the Django backend (`cafe-back`). The menu page demonstrates the API integration using the services created in `lib/services/`.

## Technologies Used

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Lucide React Icons
- Django REST API (backend)
