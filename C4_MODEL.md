# C4 Model: Aman Unified Border Control System

This document outlines the architecture of the Aman system using the C4 model for visualizing software architecture.

---

## Level 1: System Context

This diagram shows the Aman system as a black box in its environment, interacting with users and external systems. It illustrates the high-level boundaries of the system.

```mermaid
graph TD
    subgraph "Aman - Unified Border Control System"
        AmanSystem["`**Aman System**\n\nA unified, AI-powered platform for border control operations.`"]
    end

    subgraph "Users"
        Admin["`**Administrator**\n\nManages users and system-wide configurations.`"]
        Supervisor["`**Shift Supervisor**\n\nManages officer workloads and reviews escalated cases.`"]
        Officer["`**Border Officer**\n\nProcesses passengers at checkpoints.`"]
        ControlRoom["`**Control Room Operator**\n\nMonitors system status and E-Gate operations.`"]
        Analyst["`**Security Analyst**\n\nReviews data and identifies trends.`"]
    end

    subgraph "External Systems"
        GoogleAI["`**Google AI (Genkit)**\n\nProvides generative AI services for data extraction and risk assessment.`"]
        NationalWatchlist["`**(Future) National Watchlist**\n\nExternal database of persons of interest.`"]
        VisaSystem["`**(Future) Visa Information System**\n\nExternal system for visa verification.`"]
        Hardware["`**(Future) Physical Hardware**\n\nPassport scanners, cameras, E-Gates.`"]
    end

    Admin -->|Manages| AmanSystem
    Supervisor -->|Uses| AmanSystem
    Officer -->|Uses| AmanSystem
    ControlRoom -->|Monitors via| AmanSystem
    Analyst -->|Analyzes data from| AmanSystem
    
    AmanSystem -->|Makes requests to| GoogleAI
    GoogleAI -->|Returns analysis to| AmanSystem
    
    AmanSystem -.->|Queries| NationalWatchlist
    AmanSystem -.->|Verifies with| VisaSystem
    AmanSystem -.->|Interfaces with| Hardware

    classDef system fill:#1168bd,stroke:#0b4e8b,color:#fff
    classDef person fill:#08427b,stroke:#042647,color:#fff
    classDef external fill:#999,stroke:#666,color:#fff

    class AmanSystem system
    class Admin,Supervisor,Officer,ControlRoom,Analyst person
    class GoogleAI,NationalWatchlist,VisaSystem,Hardware external
```

---

## Level 2: Container Diagram

This diagram zooms into the Aman system, breaking it down into its high-level containers (applications, data stores, APIs).

```mermaid
graph TD
    subgraph "Aman - Unified Border Control System"
        direction LR
        subgraph "Client-Side (User's Browser)"
            Frontend["`**Frontend Web Application**\n[Next.js / React]\n\nProvides the user interface for all modules and functionalities.`"]
        end

        subgraph "Server-Side (Firebase App Hosting)"
            Backend["`**Backend for Frontend (BFF)**\n[Next.js Server]\n\nHandles server-side rendering, API requests, and business logic via Server Actions.`"]
            AIAgent["`**Genkit AI Agent**\n[Genkit / Gemini]\n\nContains the AI flows for passport data extraction and risk assessment.`"]
            MockAPI["`**Mock Database & API**\n[TypeScript In-Memory]\n\nSimulates a production database and backend services.`"]
        end
    end

    subgraph "External Systems"
        GoogleAI["`**Google AI Services**\n[Gemini 2.0 Flash]\n\nExternal generative AI models.`"]
    end

    Users[Users]
    
    Users -->|Interacts with| Frontend
    Frontend -->|Makes API calls/invokes actions| Backend
    Backend -->|Serves pages/data to| Frontend
    Backend -->|Invokes| AIAgent
    Backend -->|Reads/Writes to| MockAPI
    AIAgent -->|Makes requests to| GoogleAI
    GoogleAI -->|Returns results to| AIAgent

    classDef web fill:#2d8ac7,stroke:#1a6da8,color:#fff
    classDef api fill:#1a6da8,stroke:#0b4e8b,color:#fff
    classDef db fill:#999,stroke:#666,color:#fff
    classDef external fill:#999,stroke:#666,color:#fff
    
    class Frontend web
    class Backend,AIAgent api
    class MockAPI db
    class GoogleAI external
```

---

## Level 3: Component Diagram (Backend for Frontend)

This diagram decomposes the **Backend for Frontend (BFF)** container, showing its main components and their interactions.

```mermaid
graph TD
    subgraph "Backend for Frontend (BFF) Container"
        direction TB
        ServerActions["`**Server Actions**\n[Next.js]\n\nHandles form submissions and data mutations from the client (e.g., saving a user, updating a port).`"]
        APIRoutes["`**API Route Handlers**\n[Next.js]\n\nServes data to the client-side components (e.g., fetching dashboard stats).`"]
        AuthProvider["`**Authentication Component**\n[/src/hooks/use-auth.ts]\n\nManages user sessions and permissions.`"]
        MockAPIClient["`**Mock API Client**\n[/src/lib/mock-api.ts]\n\nActs as the data access layer, routing all requests to the in-memory data store.`"]
        AIFlows["`**AI Flow Wrappers**\n[/src/ai/flows/*.ts]\n\nServer-side functions that invoke Genkit flows for AI processing.`"]
    end
    
    subgraph "External Containers"
        AIAgent["`**Genkit AI Agent**`"]
        MockAPI["`**Mock Database & API**`"]
        Frontend["`**Frontend Web App**`"]
    end
    
    Frontend -->|Invokes| ServerActions
    Frontend -->|Fetches data from| APIRoutes
    ServerActions -->|Uses| AuthProvider
    APIRoutes -->|Uses| AuthProvider
    ServerActions -->|Calls| MockAPIClient
    APIRoutes -->|Calls| MockAPIClient
    MockAPIClient -->|Interacts with| MockAPI
    APIRoutes -->|Invokes| AIFlows
    AIFlows -->|Calls| AIAgent

    classDef component fill:#6aa6e3,stroke:#2d8ac7,color:#000
    classDef external_container fill:#2d8ac7,stroke:#1a6da8,color:#fff

    class ServerActions,APIRoutes,AuthProvider,MockAPIClient,AIFlows component
    class AIAgent,MockAPI,Frontend external_container
```

This C4 model provides a clear, layered view of the Aman system's architecture, from the highest-level context down to the key components within the backend.