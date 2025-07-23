# **App Name**: Guardian Gate Unified

## Core Features:

- UI Component Library: Centralized UI components (Input, Dropdown, Button) for consistent design across all portals, based on the Guardian Gate Lite application design.
- Auth Routing: Authentication routing to protect pages based on user roles. Centralized auth routing and permission middleware.
- API Service Interceptor: API service layer with interceptors to inject authentication tokens into requests.
- Result Object: Standardized API responses using a `Result` object to handle errors, warnings, and information messages; API contracts are defined in types/api/contracts.ts.
- Global Layout: Global layout components (Header, Sidebar, Footer) for consistent navigation and branding, based on the Guardian Gate Lite application design.
- Dynamic navigation: The side bar navigation includes links and icons that are dynamically generated based on role, based on the Guardian Gate Lite application design.
- Anomaly detection: AI tool that flags edge case API responses in the client app that could indicate security issues

## Style Guidelines:

- Primary color: Dark blue (#2E4765) to convey security, trust, and stability.
- Background color: Light gray (#F0F4F7), a very desaturated shade of blue, for a clean and professional look.
- Accent color: Light orange (#F2A65A), an analogous color to blue, for highlights and calls to action.
- Body and headline font: 'Inter', a sans-serif font for a clean, modern and easily readable interface.
- Use a set of consistent and clear icons, related to security, transport, and data, across all modules. Favor simple, geometric designs.
- Maintain a consistent layout across all modules, using a sidebar navigation and a clear content area. Use a grid system for responsive design.
- Subtle animations for loading states and transitions to improve user experience without being distracting.