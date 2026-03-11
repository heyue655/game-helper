# AGENTS.md - Agent Coding Guidelines

## Project Overview

This is a game order platform with:
- **Backend**: Node.js + Express + Prisma (MySQL + Redis)
- **Frontend**: React 19 + Vite + TypeScript (mobile H5)

---

## Build / Lint / Test Commands

### Backend (Express)

```bash
# Start development server (hot reload)
cd backend && npm run dev

# Start production server
cd backend && npm start

# Prisma commands
cd backend && npm run prisma:generate   # Generate Prisma client
cd backend && npm run prisma:push       # Push schema to database
```

### Frontend (React H5)

```bash
# Start development server
cd h5 && npm run dev

# Build for production
cd h5 && npm run build

# Preview production build
cd h5 && npm run preview

# Run TypeScript type checking only
cd h5 && npx tsc --noEmit
```

### Single Test Execution

> **No tests currently exist in this project.** If adding tests:
> - Backend: Use Jest or Mocha (`npm test`)
> - Frontend: Use Vitest or Jest (`npm run test`)

---

## Code Style Guidelines

### Encoding (CRITICAL)

**This project uses UTF-8 encoding with Chinese content. Follow these rules strictly:**

1. **Edit Chinese files with Write tool** - Never use Edit/StrReplace on files containing Chinese (breaks multi-byte UTF-8 characters)
2. **Verify after editing** - Always Read back the file to confirm no corruption
3. **No Unicode escapes** - Never use `\u4e2d\u6587`; use actual Chinese characters
4. **No mojibake** - Never allow `????`, `å·²ä¸æ¶`, or similar garbage

### General Formatting

- **Indentation**: 2 spaces (follow `.editorconfig`)
- **Line endings**: LF
- **Charset**: UTF-8
- **Trailing whitespace**: Trimmed
- **Final newline**: Inserted

### Backend (Node.js/Express)

**Imports (order: built-in → external → internal):**
```javascript
const express = require('express')
const cors = require('cors')
const path = require('path')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { PrismaClient } = require('@prisma/client')
const redis = require('../utils/redis')
const { success, fail } = require('../utils/response')
```

**Naming Conventions:**
- Files/Functions/Variables: `camelCase` (e.g., `authController.js`, `sendCode`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `CODE_TTL = 300`)
- Database fields: `snake_case` (handled by Prisma)

**Error Handling:**
- Use middleware for auth: `authUser`, `authAdmin`, `authSuper`
- Return responses via `success(res, data)` or `fail(res, message, statusCode)`
- Global error handler in `app.js` returns 500 with error message
- Prisma errors: let them propagate to global handler

### Frontend (React/TypeScript)

**Imports (order: React → external → internal):**
```jsx
import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import axios from 'axios'
import PageLayout from '../components/PageLayout'
```

**Naming Conventions:**
- Components: `PascalCase` (e.g., `HomePage`, `ProductCard`)
- Hooks: `camelCase` starting with `use` (e.g., `useAuth`)
- Props interfaces: `Props` suffix (e.g., `ProductCardProps`)

**TypeScript:** Enable strict mode, use explicit types, prefer interfaces over types

**State Management:** Use Zustand for global state (`h5/src/store/auth.js`), local state with `useState`

**API Calls:** Use axios with interceptors for auth tokens, handle 401 → redirect to login

### CSS / Styling

- Use Tailwind CSS classes
- Custom styles via `style={{ }}` prop for dynamic values
- Use `className` for static classes

---

## Database (Prisma)

- Schema: `backend/prisma/schema.prisma`
- Generate client: `npm run prisma:generate`
- Push changes: `npm run prisma:push`
- Use BigInt for IDs (`req.userId = BigInt(payload.id)`)

---

## Environment Variables

- Backend: `backend/.env` (MySQL, Redis, JWT secrets)
- Frontend: `h5/.env` (VITE_API_BASE_URL)
- Never commit secrets to version control

---

## Key Files

| Purpose | Path |
|---------|------|
| Backend entry | `backend/src/server.js` |
| Express app | `backend/src/app.js` |
| Auth middleware | `backend/src/middleware/auth.js` |
| Response utils | `backend/src/utils/response.js` |
| Frontend entry | `h5/src/main.jsx` |
| API client | `h5/src/api/request.js` |
| Auth store | `h5/src/store/auth.js` |
| Prisma schema | `backend/prisma/schema.prisma` |
