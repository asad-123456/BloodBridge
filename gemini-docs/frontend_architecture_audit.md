# BloodBridge Frontend Architecture Audit

## 1. Structural Flaws & Architectural Inconsistencies
*   **Massive Unmemoized Contexts (`src/context/AppStateContext.tsx`, `src/context/AuthContext.tsx`):**
    Both `AppStateContext` and `AuthContext` provide new object references on every render (`value={{ ... }}`). Since React Context uses reference equality, any state change in `AppStateProvider` causes *every* component consuming `useAppState` to unnecessarily re-render, leading to severe performance degradation.
    *Fix:* Wrap context values in `useMemo` and export memoized functions using `useCallback`.
*   **State Reset via Key Prop (`src/App.tsx`):**
    `AppStateBoundary` uses `key={user?.id ?? "logged-out"}`. This forces a complete DOM unmount and remount of `AppRoutes` whenever the user logs in or out. This destroys internal DOM state (focus, scroll, form values in public routes) and degrades performance.
    *Fix:* Remove the `key` prop and handle session clearing internally within `AppStateProvider` when the user session changes.
*   **Mixed State Management (Local vs. API) (`src/context/AppStateContext.tsx`):**
    Functions like `verifyHospitalRequest` execute both "local" state updates and API calls. However, when an API call is made, it discards optimistic UI updates and blindly refetches the *entire* collection (e.g., `getHospitalPendingRequests()`), overwriting the state and causing jarring re-renders. 
    *Fix:* Use optimistic updates uniformly and selectively update specific modified records in the local state upon successful API responses.

## 2. State Management Bugs
*   **Render-Phase Side Effects (`src/App.tsx`):**
    In `ProtectedPortal`, there is an illegal side effect during the render phase:
    `if (!user || !user.isActive) { if (user) logout(); return <Navigate ... /> }`
    Calling `logout()` (which triggers a state update via `setUser`) while React is calculating the render violates React's pure render rule and throws a strict-mode error ("Cannot update a component while rendering a different component").
    *Fix:* Move the `logout()` call into a `useEffect` hook.
*   **Stale Closures / Missing Dependencies (`src/context/AppStateContext.tsx`):**
    Callback functions inside `AppStateProvider` capture the current state (like `requests` or `users`) but are recreated on every render. If these functions are passed to child components that memoize them (e.g., via `useEffect` dependencies or `memo`), those children will hold onto stale closures and interact with outdated state.

## 3. Missing API Error Boundaries
*   **Unhandled Promise Rejections in API Calls (`src/context/AppStateContext.tsx`):**
    In `AppStateContext`, asynchronous API calls (e.g., `verifyHospitalRequestApi`, `fulfillFromStockApi`, `updateAdminUserStatus`) entirely lack `try/catch` blocks. 
*   **Ineffective Global Error Boundary (`src/components/common/ErrorBoundary.tsx`):**
    The app uses a top-level React `ErrorBoundary`, but React error boundaries *do not* catch errors in asynchronous code (Promises, event handlers). Thus, API network failures or HTTP 500 errors will result in silent UI failures (e.g. infinite loading spinners) and unhandled rejections rather than a graceful fallback.
    *Fix:* Add `try/catch` to all async context methods, emit toast notifications on failure (e.g. using `react-hot-toast`), and handle loading/error states explicitly. 

## 4. Routing Vulnerabilities
*   **Unprotected Auth Routes (`src/pages/auth/PortalLogin.tsx`):**
    `PortalLogin` components do not check if a user is already authenticated. An already logged-in user could navigate to another role's login page (e.g., `/admin/login`), view the form, and attempt to authenticate again, creating conflicting application states.
    *Fix:* Add an authentication check in `PortalLogin` (or a `PublicOnlyRoute` wrapper) to redirect active sessions to their respective dashboards.
*   **Session Storage Limitations (`src/context/AuthContext.tsx`):**
    Auth tokens are stored using `window.sessionStorage`. This prevents session persistence across new tabs or windows, severely degrading the experience for an emergency-response application where users might open links in multiple tabs. 
    *Fix:* Migrate to `window.localStorage` or secure HTTP-only cookies.
