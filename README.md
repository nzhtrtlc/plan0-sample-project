# Plan0 Sample Project

This is a small full-stack web application built as a case study.  
The application takes a PDF input and user-entered data, extracts structured information from the PDF, and generates a new PDF output that combines all data into a clean summary document.

The project is structured as a **monorepo** using **npm workspaces**, with separate frontend and backend applications sharing common TypeScript types.

---

## ✨ Features

- Upload a PDF file
- Extract address/location information from the PDF
- Collect user inputs (project name, billing entity)
- Generate a fee table based on staff, hours, and rates
- Generate a final PDF document that includes:
  - Project details
  - Extracted address
  - Fee breakdown table
- Download the generated PDF from the browser

---

## 🧠 Architecture Overview

- **Frontend**

  - React + TypeScript
  - Vite for development and build
  - Handles file upload, form inputs, fee calculation UI
  - Triggers PDF generation and downloads the result

- **Backend**

  - Node.js + Express
  - PDF parsing for extracting text/address
  - PDF generation using `pdf-lib`
  - Exposes REST endpoints for:
    - PDF extraction
    - PDF generation

- **Shared Types**
  - Centralized TypeScript types for API payloads
  - Prevents frontend/backend contract drift

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm (v9+)

---

## 📦 Install Dependencies & Run Project


```bash
npm install
```

```bash
npm run dev
```

```bash
npm run backend
```

```bash
npm run frontend
```
