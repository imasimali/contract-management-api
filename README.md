# Contract Management API

Node.js/Express.js REST API for managing client and contractor profiles, contracts, and jobs. Built with Sequelize and SQLite.

## Features

- Manage client and contractor profiles
- Create and manage contracts between clients and contractors
- Track job payments and balances
- Administrative endpoints for analytics
- End-to-end (e2e) testing
- Swagger documentation for API validation

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm (Node Package Manager)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/imasimali/contract-management-api.git
    cd contract-management-api
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Seed the database:

    ```bash
    npm run seed
    ```

    **Warning:** This will drop the existing database if it exists.

4. Start the server:

    ```bash
    npm start
    ```

    The server will run on `http://localhost:3001`.

## Data Models

### Profile

- Represents either a client or a contractor.
- Clients create contracts with contractors.
- Contractors perform jobs for clients and get paid.
- Each profile has a balance property.

### Contract

- Represents an agreement between a client and a contractor.
- Contracts have three statuses: `new`, `in_progress`, `terminated`.
- Contracts are considered active only when in status `in_progress`.
- Contracts group jobs within them.

### Job

- Represents work done by contractors for clients under a specific contract.
- Contractors get paid for jobs by clients.

## Middleware

### getProfile

- Authenticates users by `profile_id` passed in the request header.
- After authentication, the profile is available under `req.profile`.
- Ensures only users that are part of a contract can access their contracts.

## API Endpoints

### GET /contracts/:id

- Returns the contract only if it belongs to the authenticated profile.

### GET /contracts

- Returns a list of contracts belonging to the authenticated profile.
- Only non-terminated contracts are returned.

### GET /jobs/unpaid

- Returns all unpaid jobs for the authenticated profile.
- Only includes jobs for active contracts.

### POST /jobs/:job_id/pay

- Allows a client to pay for a job if their balance is sufficient.
- Transfers the amount from the client's balance to the contractor's balance.

### POST /balances/deposit/:userId

- Deposits money into a client's balance.
- A client cannot deposit more than 25% of their total unpaid job amounts.

### GET /admin/best-profession?start=<date>&end=<date>

- Returns the profession that earned the most money within the specified date range.

### GET /admin/best-clients?start=<date>&end=<date>&limit=<integer>

- Returns the clients who paid the most for jobs within the specified date range.
- Supports a `limit` query parameter (default is 2).

## End-to-End Testing

End-to-end (e2e) tests have been implemented to ensure the API works as expected. To run the tests:

```bash
npm run test
