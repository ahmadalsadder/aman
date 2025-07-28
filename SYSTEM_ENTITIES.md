# Aman System Entities & Actions

This document provides a comprehensive overview of the core data entities and the granular actions (permissions) that govern the Aman Unified Border Control System.

---

## 1. Core Data Entities

This section details the primary data structures used throughout the application.

### 1.1 `User`

Represents an individual who can log in and interact with the system.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` (UUID) | Unique identifier for the user. |
| `name` | `string` | User's full name. |
| `email` | `string` | User's login email address. |
| `role` | `Role` (enum) | The primary role of the user (e.g., 'admin', 'officer'). |
| `modules` | `Module[]` (array) | List of system modules the user can access. |
| `permissions`| `Permission[]` (array)| Fine-grained list of actions the user can perform. |

### 1.2 `Passenger`

Represents a traveler being processed by the system.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` (UUID) | Unique identifier for the passenger record. |
| `firstName` | `string` | Passenger's first name. |
| `lastName` | `string` | Passenger's last name. |
| `passportNumber`| `string` | Unique passport identifier. |
| `nationality` | `string` | Passenger's country of nationality. |
| `dateOfBirth` | `string` (date) | Passenger's date of birth. |
| `riskLevel` | `RiskLevel` (enum) | System-calculated risk assessment (Low, Medium, High). |
| `status` | `PassengerStatus` (enum)| Current status of the passenger record (e.g., Active, Flagged). |

### 1.3 `Transaction`

Represents a single border crossing event for a passenger.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` (UUID) | Unique identifier for the transaction. |
| `passengerId`| `string` (FK) | Links to the `Passenger` being processed. |
| `status` | `TransactionStatus` (enum)| The outcome of the transaction (e.g., Completed, Failed, Pending). |
| `riskScore` | `number` | AI-generated risk score (0-100). |
| `finalDecision`| `Decision` (enum)| Final decision made by the officer (Approved, Rejected). |
| `officerName` | `string` | Name of the processing officer. |
| `tripInformation`| `object` | Context-specific details (flight, vehicle, or vessel info). |

### 1.4 `Port`

Represents a major point of entry (e.g., an entire airport).

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` (UUID) | Unique identifier for the port. |
| `name` | `string` | The official name of the port (e.g., Dubai International Airport). |
| `type` | `PortType` (enum) | The type of port (Airport, Seaport, Landport). |
| `status` | `Status` (enum) | Operational status (Active, Inactive). |

### 1.5 `Terminal`

Represents a specific building or area within a `Port`.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` (UUID) | Unique identifier for the terminal. |
| `name` | `string` | The name of the terminal (e.g., "Terminal 3"). |
| `portId` | `string` (FK) | Links to the parent `Port`. |
| `status` | `Status` (enum) | Operational status (Active, Inactive). |

### 1.6 `Zone`

Represents a specific area within a `Terminal` (e.g., "Departures Hall A").

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` (UUID) | Unique identifier for the zone. |
| `name` | `string` | The name of the zone. |
| `terminalId`| `string` (FK) | Links to the parent `Terminal`. |
| `status` | `Status` (enum) | Operational status (Active, Inactive). |

### 1.7 `Machine` / `OfficerDesk`

Represents a physical or logical point where transactions occur.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` (UUID) | Unique identifier. |
| `name` | `string` | The name of the machine or desk (e.g., "Passport Scanner A1-1"). |
| `type` | `MachineType` (enum) | Type of hardware (Scanner, Camera, Biometric). |
| `zoneId` | `string` (FK) | Links to the parent `Zone`. |
| `status` | `MachineStatus`/`OfficerDeskStatus`| Operational status. |

### 1.8 `Shift` & `OfficerAssignment`

Represents work schedules for officers.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` (UUID) | Unique identifier. |
| `name` | `string` | Name of the shift (e.g., "Morning Shift"). |
| `startTime` | `string` (time) | The start time of the shift. |
| `officerId` | `string` (FK) | (In `OfficerAssignment`) Links to the `User`. |
| `assignmentDate`| `string` (date)| (In `OfficerAssignment`) The date the officer is assigned. |

### 1.9 `Blacklist` / `Whitelist`

Represents lists of individuals requiring special attention.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` (UUID) | Unique identifier for the list entry. |
| `passengerId`| `string` (FK) | Links to the `Passenger`. |
| `reason` | `string` | The reason for the entry. |
| `category` | `BlacklistCategory` (enum)| (Blacklist only) The severity or type of flag. |
| `validUntil` | `string` (date)| The expiration date for the entry. |

---

## 2. System Actions (Permissions)

This section details the granular permissions used to control access to system features, grouped by module.

### 2.1 General & Cross-Module
- **`users:manage`**: Allows creating, editing, and deleting user accounts.
- **`reports:view`**: Allows viewing and generating system-wide reports.
- **`duty-manager:view`**: Allows accessing the Duty Manager queue for escalated transactions.

### 2.2 Airport (`airport:`)
- **`passengers:view/create/edit/delete`**: Full CRUD control over airport passenger records.
- **`blacklist:view/create/edit/delete`**: Full CRUD control over the airport blacklist.
- **`whitelist:view/create/edit/delete`**: Full CRUD control over the airport whitelist.
- **`transactions:view`**: View historical airport transactions.
- **`transactions:live`**: Access the live processing workflow for officers.
- **`dashboard:view`**: View the main airport dashboard.
- **`prediction:view`**: Access predictive analytics for the airport.
- **`desks:view/create/edit/delete`**: Manage officer desks for the airport.
- **`workload:view/create/edit/delete`**: Manage shifts and officer assignments for the airport.
- **`civil-records:view`**: View associated civil records.

### 2.3 Landport (`landport:`)
- *(Permissions mirror the Airport module but are scoped to landport operations.)*

### 2.4 Seaport (`seaport:`)
- *(Permissions mirror the Airport module but are scoped to seaport operations.)*

### 2.5 E-Gate (`egate:`)
- **`records:view/create/edit/delete`**: Manage E-Gate hardware records.
- **`transactions:view`**: View historical E-Gate transactions.
- **`dashboard:view`**: View the main E-Gate dashboard.
- **`media:view/create/edit/delete`**: Manage multimedia content displayed on E-Gates.
- **`workload:view/create/edit/delete`**: Manage shifts and assignments for E-Gate support staff.
- *(Also includes `passengers`, `blacklist`, `whitelist`, etc. scoped to E-Gate context.)*

### 2.6 Analyst (`analyst:`)
- **`dashboard:view`**: View the analyst dashboard with advanced analytics.
- **`records:view/create/edit/delete`**: Allows managing specific analytical records or reports.

### 2.7 Control Room (`control-room:`)
- **`dashboard:view`**: View the main Control Room dashboard.
- **`gate-log:view`**: View the live event log from all E-Gates.
- **`records:view`**: View various system records from a central point.

### 2.8 Configuration (`configuration:`)
- **`ports:view/create/edit/delete`**: Manage Ports.
- **`terminals:view/create/edit/delete`**: Manage Terminals.
- **`zones:view/create/edit/delete`**: Manage Zones.
- **`machines:view/create/edit/delete`**: Manage Machines and Officer Desks.
- **`system-messages:view/create/edit/delete`**: Manage global system messages.
- **`country-language:view/edit`**: Manage language mappings for countries.
- **`country-passport:view/edit`**: Manage passport type mappings for countries.
- **`lookups:view/create/edit/delete`**: Manage system-wide lookup values (e.g., lists of countries, statuses).
