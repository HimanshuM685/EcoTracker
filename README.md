# 🌱 EcoTrack — Scan. Earn. Recycle. 🌍

EcoTrack is a web-based sustainability platform that rewards users for scanning product barcodes and verifying eco-friendly actions like recycling. We aim to drive real-world impact by making it fun and rewarding to track and reduce individual carbon footprints.

---

## ✨ Key Features

### 📦 Barcode Scanning
- Users scan packaged product barcodes using their phone or webcam.
- We fetch real-time sustainability data from [OpenFoodFacts](https://world.openfoodfacts.org/).
- Users receive an initial reward in the form of *EcoPoints* for every unique scan.

### 🔁 Recycle & Verify
- Users can redeem their * EcoPoints* when they verify that the scanned product was recycled or disposed of responsibly (via photo or barcode rescan after disposal).

### 🧠 Open Sustainability Database
- We use OpenFoodFacts for raw product data like ingredients, nutrition, packaging, and origin.
- Our system calculates a *Sustainability Score* and presents it to users in a friendly UI.

### 💸 Ad-Based Revenue & Brand Partnerships
To make the reward economy financially sustainable:
- Ads are shown contextually during scan or results screens.
- We partner with sustainable brands who want exposure and engagement from eco-conscious users.
- Sponsored challenges, product trials, or discount coupons will be offered in exchange for EcoPoints.

---

## 🎯 Our Point System

| Action                    | Points Earned |
| ------------------------- | ------------- |
| First Scan of a Product   | 10 EcoPoints  |
| Completing Eco Challenges | Varies        |


> ✅ Duplicate scans do not generate additional points.
> 🔐 Points are linked to the authenticated user via secure JWT sessions.

---

## 🛍 How EcoPoints Can Be Used

We are building a *closed-loop reward system* where users can redeem EcoPoints for:

- Discounts on eco-friendly goods via our brand partners.
- Digital badges or leaderboard ranks.
- Access to premium features (coming soon).
- Tree-planting contributions or donation credits.

---

## 🏗 Tech Stack

| Layer          | Tools / Frameworks                       |
|----------------|-------------------------------------------|
| Frontend       | Next.js, React, TailwindCSS, Zxing |
| Backend        | Node.js, Express.js, MongoDB, JWT |
| Data Source    | OpenFoodFacts API                       |
| Auth           | JWT-based Auth with sessions              |
| Infra          | Self-hosted or cloud-deployed Node stack  |

---

## 🔐 How It Works

### 1. Scan
- User logs in and scans a product barcode using the web app.

### 2. Get Points
- Backend checks for uniqueness, fetches data, and awards *EcoPoints*.

### 3. Verify Recycle
- User uploads proof (photo, rescan) after recycling the product.
- Admin (or AI model) verifies, and bonus points are credited.

### 4. Redeem & Engage
- Use points for real-world perks, challenges, or redeem with partner brands.

---

## 🌍 Vision

> “Make eco-responsible behavior part of daily life through education and rewards.”

We believe small actions lead to big change — especially when incentivized.
EcoTrack aims to:

- Create awareness around sustainable choices.
- Use gamification to drive behavior change.
- Build a funding model that sustains the environment and the business.

---

## 💼 Sustainability Model

- *Ad Revenue*: Show non-intrusive ads during scanning and dashboard use.
- *Brand Sponsorships*: Partner with green brands for targeted exposure in exchange for supporting the reward pool.
- *Referral Campaigns*: Users bring more users and grow the network organically.
- *Eco Challenges*: Brands can launch point-based campaigns that users complete (e.g., “Recycle 3 soda bottles to win a 10% coupon”).

---

## 🧠 Future Roadmap

- [ ] AI-assisted recycling verification (image-based).
- [ ] Localized leaderboards and community drives.
- [ ] Redeem points for physical goods (eco kits, compost bins).
- [ ] Optional blockchain/token-based system in future phases.
- [ ] Mobile PWA for better camera & scan UX.

---

## 🚀 Getting Started (Dev Setup)

### 📦 Install Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install