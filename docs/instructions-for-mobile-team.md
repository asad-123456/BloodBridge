# BloodBridge - Integration Guide for Mobile App Team
**Date**: 2026-09-19

Welcome! This document outlines everything you need to know to connect your mobile application (iOS/Android/Cross-platform) to the unified BloodBridge backend. 

**Good news:** You do not need to build your own backend, database, or matching algorithms. The existing FastAPI backend has been fully engineered to support the mobile civilian workflows (Donors & Requestors) alongside the institutional web workflows (Hospitals & NGOs).

---

## 1. The API & Documentation (Swagger)

The backend is built in **FastAPI**. This means your API documentation is automatically generated, always up-to-date, and interactive.
* When the backend is deployed (or running locally), simply navigate to `<API_BASE_URL>/docs` in your browser.
* You will see the complete OpenAPI (Swagger) UI detailing every endpoint, required JSON body, and response schema. You can even test requests directly from the browser.

## 2. Authentication Flow

The backend uses **stateless JWT Authentication** with Argon2 password hashing. 
* **Signup/Login**: Hit `POST /donors/signup`, `POST /donors/login`, `POST /requestors/signup`, or `POST /requestors/login`.
* **The Token**: On successful login, you will receive a JSON response containing an `access_token`.
* **Making Requests**: Attach this token to all subsequent API requests in the HTTP Header:
  `Authorization: Bearer <your_jwt_token_here>`

## 3. Core Mobile Workflows

The backend handles the heavy lifting for you. You just need to build the UI and hit these endpoints:

### A. The Requestor Workflow (Asking for Blood)
1. **Create Request**: `POST /blood-requests/`. You will send the required blood type, urgency, and the user's GPS coordinates (`latitude`/`longitude`).
2. **Hospital Verification**: You don't need to worry about this. Once created, the request goes into a queue for the Web Portal. A real hospital will verify it. Once verified, its status changes to `active` and it becomes visible to donors.

### B. The Donor Workflow (Giving Blood)
1. **The Geo-Feed**: `GET /blood-requests/nearby/for-me`. 
   * *Magic happens here.* You don't need to calculate distances. The backend uses PostGIS to automatically filter requests and will **only** return emergencies that are (1) within the request's dynamic radius of the donor's GPS location, and (2) medically compatible with the donor's specific blood type.
2. **Accepting a Match**: `POST /request-matches/{request_id}/accept`. 
   * The backend prevents double-booking (race conditions) at the database level. If two donors click accept at the same time, the API ensures only the requested units are fulfilled.

## 4. Real-Time Chat

Once a donor accepts a request, a `RequestMatch` is created, and the two users can communicate.
* **REST History**: Fetch previous messages via `GET /chat/{match_id}/messages`.
* **Live WebSocket**: Connect to `ws://<API_BASE_URL>/chat/ws/{match_id}?token=<jwt>`. 
  * *Note:* Because WebSockets don't support custom HTTP headers in all mobile environments, you must pass the JWT token as a query parameter in the URL.

## 5. Push Notifications (Firebase Cloud Messaging)

We rely on your mobile clients to handle Firebase Cloud Messaging (FCM) so users are alerted when someone nearby needs blood.
1. **Your Job**: Integrate the Firebase SDK into the iOS/Android app. When a donor registers or logs in, capture their FCM `device_token` and send it to the backend (via the signup or profile update endpoints).
2. **Backend Job**: The backend already contains the logic to calculate exactly who needs to be notified when an emergency occurs. Our infrastructure team will wire the backend to fire the push notification payload to the device tokens you provide.

---

## 6. Medical Cooldowns & Donor Reliability

The backend enforces strict medical and behavioral safeguards that your UI should account for:

1. **The 90-Day Cooldown**: After a donor successfully completes a blood handover, the backend automatically sets an `eligible_after` timestamp 90 days into the future. During this time, they will **not** receive push notifications, and `GET /blood-requests/nearby/for-me` will return an empty list. Your UI should detect this timestamp on the donor's profile and show a "You are in recovery" status.
2. **Reliability Score (No-show penalties)**: Every donor starts with a `reliability_score` of 100. If a donor clicks "Accept" on a match but later cancels it (flakes), the backend automatically deducts 10 points. If they drop too low, their account will be suspended. You may want to display this score in their profile to encourage commitment.

---

### Summary of Your Domain
When looking at the API docs, your team only needs to care about the endpoints tagged with:
* `Donors`
* `Requestors`
* `Blood Requests` (Creation and Feed)
* `Request Matches`
* `Chat`

You can completely ignore endpoints related to `Admin`, `Hospitals`, `Organizations`, and `Inventory` — those are exclusively for the institutional web portal. 

Happy building! Let the web team know if you need any adjustments to the payload structures.

