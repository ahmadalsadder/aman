
# Project Deliverables: Guardian Gate Unified Border Control System

## 1. Software Requirements Specification (SRS)

### 1.0 Introduction

#### 1.1 Purpose
This document specifies the software requirements for the Guardian Gate Unified Border Control System. Its purpose is to provide a comprehensive overview of the system's functionalities, constraints, and requirements for stakeholders, including developers, project managers, and quality assurance teams.

#### 1.2 Scope
Guardian Gate is a modular, web-based platform designed to unify and streamline border control operations across multiple entry points (Airport, Landport, Seaport, E-Gate). It provides role-based access to dashboards, live transaction processing, passenger record management, list management (blacklist/whitelist), workload scheduling, and system configuration. The system leverages AI for risk assessment and data extraction to enhance security and operational efficiency.

#### 1.3 Definitions, Acronyms, and Abbreviations
- **SRS:** Software Requirements Specification
- **UI:** User Interface
- **API:** Application Programming Interface
- **GenAI:** Generative Artificial Intelligence
- **RBAC:** Role-Based Access Control
- **E-Gate:** Electronic Gate for automated passenger processing
- **BI:** Business Intelligence / Analytics

### 2.0 Overall Description

#### 2.1 Product Perspective
Guardian Gate is a self-contained, web-based application intended to replace or augment existing fragmented border control systems. It serves as a central hub for various operational roles, providing real-time data, analytics, and management tools. It is built on a modern web stack (Next.js, React) and designed for modular expansion.

#### 2.2 Product Functions
The major functions of the Guardian Gate system are:
-   **Multi-Module Operations:** Provides distinct operational views for Airport, Landport, Seaport, E-Gate, Control Room, and Analyst roles.
-   **Role-Based Access Control:** A sophisticated permission system that tailors UI and functionality based on user roles (Admin, Officer, Supervisor, etc.).
-   **Dashboard & Analytics:** Visual dashboards display key performance indicators (KPIs), transaction volumes, and predictive analytics for each module.
-   **Live Transaction Processing:** Enables border officers to process passengers in real-time, including document scanning, biometric capture, and AI-assisted risk assessment.
-   **Passenger & List Management:** Centralized management of passenger records, including blacklists and whitelists.
-   **System Configuration:** A dedicated module for administrators to manage system-wide settings like ports, terminals, machines, and system messages.
-   **Workload Management:** Tools for creating shifts and assigning officers to specific locations and duties.

#### 2.3 User Characteristics
-   **Admin:** Technical user responsible for system configuration, user management, and overall system health.
-   **Shift Supervisor / Duty Manager:** Manages officer workloads, reviews escalated cases, and oversees operational efficiency for a specific module.
-   **Officer:** Front-line user responsible for processing passengers and vehicles at various checkpoints.
-   **Control Room Operator:** Monitors system-wide status, E-Gate operations, and responds to alerts.
-   **Analyst:** Reviews historical data, identifies trends, and analyzes system performance and security patterns.

#### 2.4 General Constraints
-   The system must be developed using the prescribed tech stack: Next.js, React, Tailwind CSS, ShadCN components, and Genkit for AI functionalities.
-   The system must be deployable within a Firebase App Hosting environment.
-   All AI interactions must be processed through the existing Genkit framework.
-   The user interface must support both Light and Dark themes.
-   The application must support internationalization (i18n), with initial support for English, Spanish, and Arabic.

#### 2.5 Assumptions and Dependencies
-   **Assumption:** A stable and reliable network connection is available for all client devices to communicate with the backend services.
-   **Assumption:** The mock API (`mock-api.ts`) accurately represents the data schemas and relationships that a future production backend will provide.
-   **Assumption:** The GenAI models configured (Gemini 2.0 Flash) are suitable for the required tasks (risk assessment, data extraction) and will be available in the production environment.
-   **Missing Information:** The SRS does not cover requirements for the underlying physical hardware (scanners, cameras, E-Gates) or the protocols for interfacing with them. These will need to be defined in a separate hardware specification document.
-   **Missing Information:** Specific details regarding third-party system integrations (e.g., national watchlist databases, visa systems) are not defined. The current system uses mock data and will require a dedicated integration phase.

### 3.0 Functional Requirements

#### 3.1 User Management
-   **FR-3.1.1:** The system shall allow Administrators to create, view, edit, and delete user accounts.
-   **FR-3.1.2:** The system shall enforce Role-Based Access Control (RBAC), restricting access to modules and features based on the assigned user role and permissions.

#### 3.2 System Configuration
-   **FR-3.2.1:** The system shall allow Administrators to manage Ports (Airport, Seaport, Landport), including adding, editing, and changing their status.
-   **FR-3.2.2:** The system shall allow Administrators to manage Terminals and Zones within each Port.
-   **FR-3.2.3:** The system shall allow Administrators to configure system hardware (Machines) such as scanners and cameras, assigning them to specific zones.
-   **FR-3.2.4:** The system shall allow Administrators to manage system-wide messaging and language mappings for internationalization.

#### 3.3 Dashboard & Reporting
-   **FR-3.3.1:** Each module shall feature a dedicated dashboard displaying relevant KPIs, charts, and real-time statistics.
-   **FR-3.3.2:** The system shall provide predictive analytics on passenger flow and processing times.
-   **FR-3.3.3:** The system shall present data visualizations for passenger demographics, risk rule triggers, and throughput.

#### 3.4 Transaction Processing
-   **FR-3.4.1:** The system shall provide a "Live Processing" workflow for officers.
-   **FR-3.4.2:** The system shall use AI to extract structured data from scanned passport images.
-   **FR-3.4.3:** The system shall use AI to perform risk assessments based on passenger details and face matching.
-   **FR-3.4.4:** The system shall allow officers to make a final decision (Approve/Reject) and add notes to a transaction.
-   **FR-3.4.5:** The system shall allow for transactions to be escalated to a Duty Manager for manual review.

### 4.0 Non-Functional Requirements

#### 4.1 Performance
-   **NFR-4.1.1:** Dashboard pages with multiple charts should load within 5 seconds on a standard broadband connection.
-   **NFR-4.1.2:** The AI-powered passport data extraction process shall complete within 3 seconds.
-   **NFR-4.1.3:** The system shall support at least 100 concurrent officer sessions without significant performance degradation.

#### 4.2 Security
-   **NFR-4.2.1:** User authentication shall be required for all access to the system.
-   **NFR-4.2.2:** All user roles and permissions must be enforced on the server-side (currently mocked, but required for production).
-   **NFR-4.2.3:** Sensitive passenger data should be handled securely, with considerations for encryption at rest and in transit (outside the scope of current mock implementation).

#### 4.3 Usability
-   **NFR-4.3.1:** The user interface shall be intuitive and require minimal training for new officers.
-   **NFR-4.3.2:** The application must be responsive and usable across modern web browsers on desktop devices.
-   **NFR-4.3.3:** The system must support English, Spanish, and Arabic languages, including right-to-left (RTL) layout for Arabic.

#### 4.4 Reliability
-   **NFR-4.4.1:** The system should have an uptime of 99.9%.
-   **NFR-4.4.2:** In case of an AI service failure, the system should gracefully degrade, allowing for manual data entry and processing.

---

## 2. High-Level Development Timeline

This timeline outlines a three-month development plan to take the current prototype to a production-ready state.

| **Phase** | **Duration** | **Main Objectives** | **Key Deliverables** |
| :--- | :--- | :--- | :--- |
| **Phase 1: Foundational Backend & Core Features** | 1 Month | Solidify the backend, replace mock services with live database connections, and stabilize core feature logic. | - Production-ready database schema (e.g., Firestore) for all data types. <br> - Backend services (e.g., Cloud Functions) to replace the `mock-api.ts` logic. <br> - Secure authentication flow integrated with a real user directory. <br> - Refinement of User Management and Configuration modules to use live data. |
| **Phase 2: Feature Completion & UI/UX Polish** | 1 Month | Complete all module-specific features, conduct thorough UI/UX reviews, and implement i18n for all components. | - Fully functional Workload Management (Shifts & Assignments). <br> - Complete implementation of the Duty Manager review queue. <br> - Finalized dashboards with real data feeds. <br> - Comprehensive language translations applied across the entire application. <br> - User Acceptance Testing (UAT) preparation and documentation. |
| **Phase 3: Integration, Testing & Deployment** | 1 Month | Integrate with external and hardware systems, conduct end-to-end testing, and prepare for deployment. | - **System Integration:** Connect with national watchlists, visa databases, and hardware APIs (scanners, cameras). <br> - End-to-End (E2E) and performance testing cycles. <br> - Security audit and penetration testing. <br> - Final deployment pipeline setup and production launch. |

---
