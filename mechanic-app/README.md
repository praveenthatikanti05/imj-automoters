# Mechanic Service Management System (Basic Version)

A minimal, no-frills web app for a mechanic shop:
- Customers view the company profile, browse services, and submit a service request.
- The mechanic logs in and sees all requests on a dashboard, with new ones highlighted.

## Stack (kept intentionally simple)
- **Backend:** Node.js + Express
- **Storage:** Plain JSON files in `/data` (no database to install/configure)
- **Frontend:** Plain HTML, CSS, and vanilla JavaScript (no build step, no framework)
- **"Instant" notifications:** The dashboard polls the server every 10 seconds and highlights unseen requests with a badge and row highlight.

## How to Run

1. Make sure [Node.js](https://nodejs.org) is installed (v16+).
2. Open a terminal in this folder and install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```
4. Open your browser to:
   - Customer site: http://localhost:3000
   - Mechanic login: http://localhost:3000/login.html

## Default Mechanic Login
- Username: `mechanic`
- Password: `mechanic123`

You can change these anytime in `data/config.json`.

## Project Structure
```
mechanic-app/
├── server.js              # Express server + all API routes
├── package.json
├── data/
│   ├── services.json      # List of services shown to customers (edit to add/remove services)
│   ├── requests.json      # Stores submitted service requests (auto-updated)
│   └── config.json        # Mechanic login credentials + auth token
└── public/
    ├── index.html          # Home page: company profile, services, request form
    ├── login.html           # Mechanic login page
    ├── dashboard.html        # Mechanic dashboard (protected)
    ├── css/style.css
    └── js/
        ├── main.js          # Customer-facing logic (load services, submit request)
        └── dashboard.js       # Dashboard logic (load requests, update status, polling)
```

## How It Works
- Customers fill out the form on the home page → saved to `data/requests.json` via `POST /api/requests`.
- The mechanic logs in (`POST /api/login`) and gets a token stored in the browser.
- The dashboard calls `GET /api/requests` (with the token) every 10 seconds to refresh and flag new requests.
- The mechanic can update a request's status (Pending / In Progress / Completed) directly from the dashboard.

## Notes on Simplicity / What's Not Included
This is deliberately basic so it's easy to read and modify:
- No database — data lives in JSON files (fine for low volume; swap in a real DB later if you grow).
- No real-time push (WebSockets) — uses simple polling instead, which is far less code but has up to a 10-second delay.
- One shared mechanic login rather than a full user-account system.
- No HTTPS/production hardening — add before deploying publicly.

## Easy Customizations
- **Add/edit services:** edit `data/services.json`.
- **Change shop name/colors:** edit `public/css/style.css` (`--safety-orange`, `--charcoal`) and the text in `public/index.html`.
- **Change notification refresh speed:** edit the `10000` (ms) in `public/js/dashboard.js`.
