# Certificate Issuance System

Backend-oriented system for managing certificate issuance, user authentication and document workflows.

This project was developed as a real-world application focused on secure document management, role-based access control and scalable backend architecture.

---

## 📌 Features

- User authentication and session management
- Role-based authorization (Admin / User)
- Certificate issuance workflow
- Document upload and storage
- Secure file access
- User and center management
- REST-oriented architecture
- Database integration with Supabase

---

## 🏗️ Tech Stack

### Backend
- TypeScript
- Supabase
- PostgreSQL
- Authentication & Authorization
- REST API design

### Frontend
- Angular
- Reactive Forms
- Route Guards
- Session handling

### Tools
- Git & GitHub
- Scrum methodology
- Figma (UI design)

---

## 🧠 Architecture

The system follows a separation of concerns approach:

- Authentication handled via Supabase Auth
- Business logic encapsulated in services
- Role validation through guards and database roles
- Secure document storage linked to user UUIDs

---

## 🔐 Roles

| Role | Permissions |
|------|------------|
| Admin | Manage users, certificates and documents |
| User | Upload documents and manage personal data |

---

## ⚙️ Installation

```bash
git clone https://github.com/mateoPuntoJar/certificate-issuance-system.git
cd certificate-issuance-system
npm install
