# 🧠 AroSense & Dyad AI Rules

This document defines the core technologies, coding standards, and library usage patterns for building and maintaining the **AroSense** and **Dyad** applications.

---

## ⚙️ Tech Stack Overview

| Layer         | Technology Used                     |
|--------------|--------------------------------------|
| Frontend     | React + TypeScript                   |
| Styling      | Tailwind CSS                         |
| UI Components| shadcn/ui (Radix UI foundation)      |
| Icons        | Custom SVG + `lucide-react`          |
| Routing      | React Router                         |
| State        | React Hooks + Context API            |
| Persistence  | `localStorage` via service layer     |
| Auth         | Supabase (via `AuthContext`)         |
| Backend      | Node.js + Express + SQLite (optional)|

---

## 🧩 Component & UI Guidelines

- ✅ Use **Tailwind CSS** for all styling. Avoid inline styles or external CSS unless absolutely necessary.
- 🧱 Prefer **shadcn/ui components**. If unavailable, create minimal custom components in `src/components/`.
- 🪟 Use `AppModal.tsx` for modals and `DateTimeInputGroup.tsx` for date/time inputs.
- 🎨 For icons:
  - Reuse from `src/components/icons/`
  - Prefer `lucide-react` for new icons
  - If unavailable, create a new SVG component

---

## 🧠 State & Data Management

- 🔄 Use `useState` and `useEffect` for local state.
- 🌐 Use Context API for global state (e.g., `AuthContext`).
- 💾 For persistence:
  - Use `localStorage` via service files like `babyCareService.ts`, `documentService.ts`, etc.
  - Access through the `useLocalStorage` hook only—**never directly in components**.

---

## 🚦 Routing & Navigation

- 🛣️ Use `react-router-dom` for all routing.
- 🗂️ Define main routes in `src/App.tsx`.

---

## 🔐 Authentication

- 🔑 Use `AuthContext` and `useAuth` hook to interact with Supabase.
- ❌ Do not call Supabase auth methods directly in components.

---

## 📁 File Structure Conventions

| Folder         | Purpose                          |
|----------------|----------------------------------|
| `src/pages/`   | Page-level components             |
| `src/components/` | Reusable UI components         |
| `src/utils/`   | Utility functions                 |
| `src/services/`| Data interaction logic            |

- 📛 Use **lowercase** for all directory names.

---

## 🧼 Coding Standards

- 🧾 Always use **TypeScript**.
- 📱 Ensure **responsive design** for all components.
- 🔔 Use **toasts** for user feedback (success/error).
- 🧘 Focus on **clarity and simplicity**—avoid over-engineering.
- 🚫 No server-side logic or DB calls in frontend—use service layer only.

---

## 🧪 Optional Enhancements

To future-proof Dyad and AroSense:

- ✅ Add JSDoc comments for reusable components
- 🧪 Integrate Vitest or React Testing Library
- 🧱 Implement global error boundaries
- 🔐 Use `.env.local` for sensitive configs
- ♿ Add accessibility features (ARIA, keyboard nav)
- 🔄 Set up GitHub Actions for CI/CD

---

_Updated: August 2025_  
_Maintainer: CJCreator_

