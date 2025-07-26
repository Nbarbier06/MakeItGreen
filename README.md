# Eco App – MVP

This repository contains a **minimum viable product (MVP)** for an ecological web application.

The goal of the project is to provide citizens with a simple tool to understand the ecological
impact of their purchases, discover sustainable alternatives, participate in eco‑friendly
missions and challenges, and learn how to recycle everyday products.  The project is
organised as a monorepo with two main folders:

* **client** – a React application that offers the user interface.  It implements
  authentication pages, a dashboard, ticket scanning, product recommendations, mission
  tracking and a recycling guide.  The UI follows the design guidelines defined in the
  project brief (soft colours, rounded buttons, accessible typography and micro‑animations).
* **server** – a Node.js/Express backend that exposes a handful of REST endpoints for the
  MVP.  It handles user registration, login, OCR processing via [Tesseract.js], basic
  product scoring using the [Open Food Facts](https://openfoodfacts.org) API, mission
  management, and recycling information.  For simplicity the current implementation
  stores data in memory – a real application would replace this with a database.

The application is designed to be **responsive** (mobile first) and easily extendable.
Before running the project you must install dependencies in both the client and server
subfolders.  See the `README.md` files inside each subfolder for instructions.

## Quick start

```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Run backend
cd ../server && npm start

# In another terminal run frontend
cd ../client && npm start
```

By default the backend runs on `http://localhost:3001` and the React development server
proxies API calls there (see `client/package.json`).
