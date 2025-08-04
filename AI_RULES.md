# AI Rules for AroSense Application Development

This document outlines the core technologies used in the AroSense application and provides guidelines for using specific libraries and patterns.

## Tech Stack Overview

*   **Frontend Framework**: React
*   **Language**: TypeScript
*   **Routing**: React Router
*   **Styling**: Tailwind CSS for all styling.
*   **UI Components**: shadcn/ui components are preferred for pre-built UI elements. Radix UI is used as the underlying foundation for many components.
*   **Icons**: Custom SVG icons are currently used. For new icons, `lucide-react` is the preferred library.
*   **State Management**: React's built-in hooks (`useState`, `useEffect`, `useContext`) are used for local and global state.
*   **Data Persistence (Frontend)**: `localStorage` is used for client-side data storage, managed through dedicated service files and a `useLocalStorage` hook.
*   **Authentication**: Supabase is integrated for user authentication.
*   **Backend**: A Node.js Express server with SQLite is available for potential future API integrations, though current frontend data is primarily handled via `localStorage`.

## Library Usage Guidelines

To maintain consistency and efficiency, please adhere to the following rules when developing or modifying the application:

1.  **UI Components**:
    *   Always use Tailwind CSS classes for styling. Avoid inline styles or separate CSS files unless absolutely necessary for complex, unique components.
    *   Prioritize using existing shadcn/ui components. If a required component doesn't exist in shadcn/ui or needs significant customization, create a new, small, and focused React component in `src/components/`.
    *   For modals, use the `AppModal.tsx` component.
    *   For date and time input groups, use the `DateTimeInputGroup.tsx` component.

2.  **Icons**:
    *   Reuse existing SVG icon components from `src/components/icons/`.
    *   If a new icon is needed, prefer importing it from `lucide-react`. If `lucide-react` does not offer the specific icon, create a new SVG icon component in `src/components/icons/`.

3.  **State Management & Data Persistence**:
    *   For component-level state, use `useState` and `useEffect`.
    *   For global state, leverage React's Context API (e.g., `AuthContext`).
    *   For client-side data persistence, utilize `localStorage` through the provided service files (e.g., `services/familyMemberService.ts`, `services/wellnessService.ts`, `services/babyCareService.ts`, `services/documentService.ts`) and the `useLocalStorage` hook. Do not directly access `localStorage` in components.

4.  **Routing**:
    *   All routing should be handled by `react-router-dom`.
    *   Keep the main application routes defined in `src/App.tsx`.

5.  **Authentication**:
    *   Interact with user authentication via the `AuthContext` and its `useAuth` hook, which wraps the Supabase client. Do not directly call Supabase authentication methods from components.

6.  **File Structure**:
    *   Place pages in `src/pages/`.
    *   Place reusable components in `src/components/`.
    *   Place utility functions in `src/utils/`.
    *   Place data interaction logic in `src/services/`.
    *   Keep directory names all lower-case.

7.  **General Coding Practices**:
    *   Always write code in TypeScript.
    *   Ensure responsive design for all new UI elements.
    *   Use toasts for user feedback on important events (e.g., success, error messages).
    *   Avoid premature optimization or over-engineering. Focus on clear, simple, and elegant solutions.
    *   Do not implement server-side logic or direct database interactions from the frontend; use the provided service layer.