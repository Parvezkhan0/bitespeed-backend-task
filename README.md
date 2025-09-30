# Bitespeed Backend Task: Identity Reconciliation

## Problem Statement

The goal is to create an identity reconciliation service for contact data. Given a set of contact information (email and phone number), the service needs to identify if the contact already exists in the database and link it appropriately. Contacts should be classified as either primary or secondary, and any new contact information should be reconciled with existing records to maintain a unified view of each contact.

## Solution

### Overview

The service is built using Node.js with Express and Sequelize to handle database operations with a PostgreSQL database. The solution involves the following steps:

1. Accept a request with email and phone number.
2. Check if there are any existing contacts with the provided email or phone number.
3. Identify or create a primary contact based on the existing records.
4. Ensure any related contacts are linked to the primary contact.
5. Provide a response with a unified view of the contact, including all associated emails, phone numbers, and secondary contact IDs.



## Technologies Used

- **Node.js**: JavaScript runtime for building the server.
- **Express**: Web framework for handling HTTP requests and routing.
- **Sequelize**: ORM for interacting with the PostgreSQL database.
- **PostgreSQL**: Database for storing contact information.

## Endpoints

### `/identify`

**POST** `/identify`

**Request Body**:
```json
{
  "email": "user@example.com",
  "phoneNumber": "1234567890"
}
```

**Request Response**:
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["user@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": []
  }
}
```

## Hosted URL
The service is hosted and can be accessed at:
https://bitespeed-identity-api-ezch.onrender.com
