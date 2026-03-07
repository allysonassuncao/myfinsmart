# AI Rules for FinSmart Application

This document outlines the technical stack and coding guidelines for the FinSmart application. These rules are intended to ensure consistency, maintainability, and best practices across the codebase.

## Tech Stack

*   **Frontend Framework**: React
*   **Language**: TypeScript
*   **Routing**: React Router DOM
*   **Styling**: Tailwind CSS
*   **UI Components**: shadcn/ui (pre-installed and preferred)
*   **Icons**: Lucide React
*   **State Management**: React Context API (for authentication)
*   **Backend/Database**: Supabase (for authentication, database, and real-time features)
*   **Charting Library**: Chart.js (with react-chartjs-2 for React integration)
*   **Build Tool**: Vite

## Coding Guidelines

1.  **File Structure**:
    *   `src/pages/`: For top-level views/pages of the application.
    *   `src/components/`: For reusable UI components.
    *   `src/context/`: For React Context API providers.
    *   `src/lib/`: For utility functions, Supabase client, etc.
    *   `src/hooks/`: For custom React hooks (if any are created).

2.  **Styling**:
    *   Always use **Tailwind CSS** for styling. Avoid inline styles or separate CSS files unless absolutely necessary for global styles (e.g., `index.css`).
    *   Prioritize responsive design using Tailwind's utility-first approach.

3.  **UI Components**:
    *   Utilize **shadcn/ui** components whenever possible. These are already installed and configured.
    *   If a specific shadcn/ui component doesn't fit the need, create a new custom component in `src/components/`. Do not modify shadcn/ui source files directly.

4.  **Icons**:
    *   Use icons from the **Lucide React** library.

5.  **Data Fetching and State Management**:
    *   For authentication, use the provided `AuthContext` in `src/context/AuthContext.tsx`.
    *   For all other data interactions with the backend, use the **Supabase client** (`src/lib/supabase.ts`).
    *   Manage local component state using React's `useState` and `useEffect` hooks.

6.  **Forms and Modals**:
    *   Implement forms with proper validation and user feedback (e.g., loading states, error messages).
    *   Use modals for adding/editing data, ensuring a consistent user experience.

7.  **Charts**:
    *   Use **Chart.js** with `react-chartjs-2` for all data visualization needs.

8.  **Error Handling**:
    *   Display user-friendly error messages in the UI for failed operations.
    *   Log detailed errors to the console for debugging purposes.

9.  **Code Quality**:
    *   Write clean, readable, and well-commented TypeScript code.
    *   Adhere to existing code style and formatting.
    *   Ensure all new components and features are fully functional and integrated.

10. **Performance**:
    *   Optimize component rendering and data fetching to ensure a smooth user experience.
    *   Implement loading states for asynchronous operations.