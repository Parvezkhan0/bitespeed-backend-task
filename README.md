# Bitespeed Backend Task: Identity Reconciliation

Backend service for identifying and linking customer contact information across multiple purchases.

## Live Endpoint

```
https://bitespeed-identity-api-ezch.onrender.com/identify
```

## Problem Statement

FluxKart.com needs to identify and link orders made by the same customer using different email addresses and phone numbers. The service consolidates contact information by linking records that share either an email or phone number, treating the oldest contact as "primary" and subsequent ones as "secondary".

## Solution Overview

Built a RESTful API using Node.js, Express, TypeScript, and PostgreSQL that:
- Creates new primary contacts when no matching records exist
- Links new contact information to existing primary contacts as secondary records
- Merges separate primary contacts when a request reveals they belong to the same person
- Returns consolidated contact information with all associated emails and phone numbers

## API Documentation

### Endpoint: POST `/identify`

Accepts contact information and returns a consolidated view of all linked contacts.

**Request Body:**
```json
{
  "email": "string (optional)",
  "phoneNumber": "string (optional)"
}
```

**Response Format:**
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["primary@example.com", "secondary@example.com"],
    "phoneNumbers": ["123456", "789012"],
    "secondaryContactIds": [2, 3]
  }
}
```

## Example Usage

### Example 1: Creating a New Contact

**Request:**
```bash
curl -X POST https://bitespeed-identity-api-ezch.onrender.com/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"lorraine@hillvalley.edu","phoneNumber":"123456"}'
```

**Response:**
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["lorraine@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": []
  }
}
```

### Example 2: Linking Contacts (Same Phone, New Email)

**Request:**
```bash
curl -X POST https://bitespeed-identity-api-ezch.onrender.com/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"mcfly@hillvalley.edu","phoneNumber":"123456"}'
```

**Response:**
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [2]
  }
}
```

### Example 3: Merging Primary Contacts

**Initial State:**
- Contact 1: `george@hillvalley.edu`, `919191` (primary, created 2023-04-11)
- Contact 2: `biffsucks@hillvalley.edu`, `717171` (primary, created 2023-04-21)

**Request:** (Links both primaries)
```bash
curl -X POST https://bitespeed-identity-api-ezch.onrender.com/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"george@hillvalley.edu","phoneNumber":"717171"}'
```

**Response:**
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["george@hillvalley.edu", "biffsucks@hillvalley.edu"],
    "phoneNumbers": ["919191", "717171"],
    "secondaryContactIds": [2]
  }
}
```

**Result:** Contact 1 remains primary (older), Contact 2 becomes secondary.

### Example 4: Querying with Partial Information

All of these requests return the same consolidated response:

```bash
# Query by phone only
curl -X POST https://bitespeed-identity-api-ezch.onrender.com/identify \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"123456"}'

# Query by email only
curl -X POST https://bitespeed-identity-api-ezch.onrender.com/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"lorraine@hillvalley.edu"}'

# Query by secondary email
curl -X POST https://bitespeed-identity-api-ezch.onrender.com/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"mcfly@hillvalley.edu"}'
```

## Tech Stack

- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL (Supabase)
- **ORM:** Sequelize
- **Deployment:** Render
- **Containerization:** Docker

## Database Schema

```typescript
Contact {
  id: number (Primary Key, Auto-increment)
  phoneNumber: string | null
  email: string | null
  linkedId: number | null (Foreign Key to Contact.id)
  linkPrecedence: 'primary' | 'secondary'
  createdAt: timestamp
  updatedAt: timestamp
  deletedAt: timestamp | null
}
```

## Local Development

### Prerequisites
- Docker and Docker Compose installed

### Setup and Run

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/bitespeed-identity-reconciliation.git
cd bitespeed-identity-reconciliation

# Start the application
docker-compose up --build

# API will be available at http://localhost:3000
```

### Test Locally

```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","phoneNumber":"123456"}'
```

## Key Features

1. **Smart Contact Linking:** Automatically links contacts sharing email or phone number
2. **Primary Contact Merging:** When two separate primary contacts are linked, keeps the oldest as primary
3. **Recursive Updates:** Updates all secondary contacts when primaries are merged
4. **Duplicate Prevention:** Checks for exact matches before creating new records
5. **Database Retry Logic:** Handles connection failures during container startup
6. **Comprehensive Error Handling:** Validates input and handles edge cases gracefully

## Project Structure

```
├── src/
│   ├── models/
│   │   └── contact.ts          # Sequelize Contact model
│   ├── routes/
│   │   └── contact.ts          # API route handlers
│   ├── services/
│   │   └── contactService.ts   # Business logic for identity reconciliation
│   ├── database.ts             # Database configuration
│   └── index.ts                # Application entry point
├── docker-compose.yml          # Docker services configuration
├── Dockerfile                  # Container build instructions
├── package.json                # Dependencies and scripts
└── tsconfig.json              # TypeScript configuration
```

## How It Works

1. **No Existing Contacts:** Creates a new primary contact
2. **Single Match Found:** Creates a secondary contact linked to the existing primary
3. **Multiple Primaries Found:** 
   - Keeps the oldest contact as primary
   - Converts newer primary(s) to secondary
   - Updates all secondary contacts linked to demoted primaries
   - Creates a new secondary if the request contains new information

## Assignment Details

This project was built as part of the Bitespeed Backend Task for Identity Reconciliation.

**Assignment Link:** [Bitespeed Backend Task](https://bitespeed.notion.site/Bitespeed-Backend-Task-Identity-Reconciliation-53392ab01fe149fab989422300423199)

## Repository

**GitHub:** [bitespeed-identity-reconciliation](https://github.com/YOUR_USERNAME/bitespeed-identity-reconciliation)
