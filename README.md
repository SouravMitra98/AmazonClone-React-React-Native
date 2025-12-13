🛒 Amazon Clone – Full Stack (React · React Native · FastAPI)

A full-stack Amazon-style e-commerce platform built to demonstrate real-world system design, API development, and multi-client architecture.

This project includes:

📱 Mobile App (React Native – User side)

🧑‍💼 Admin Dashboard (React Web)

⚙ Backend APIs (FastAPI + MongoDB)


> Built as a portfolio project with production-like structure and extensibility in mind.




---

📸 Screenshots

📱 Mobile App (React Native)

<img src="./screenshot/Screenshot 2025-12-12 001433.png" width="250" />
<img src="./screenshot/mobile_product.png" width="250" />
<img src="./screenshot/mobile_cart.png" width="250" />
<img src="./screenshot/mobile_checkout.png" width="250" />
---

🧑‍💼 Admin Panel (React Web)

<img src="./screenshot/admin_login.png" />
<img src="./screenshot/admin_products.png" />
<img src="./screenshot/admin_categories.png" />
<img src="./screenshot/admin_orders.png" />
---

🚀 Features

User (Mobile App)

User authentication (JWT)

Product listing & product details

Category-based browsing

Add to cart & quantity management

Checkout flow

Order placement

Secure token storage (Expo SecureStore)



---

Admin (Web Dashboard)

Admin authentication

Product CRUD (add / edit / delete / update)

Category management

Order management

View order & payment status

Image URLs supported for products



---

Backend (FastAPI)

RESTful API architecture

JWT-based authentication

MongoDB (async motor driver)

Clean route separation (auth, products, orders, categories)

Schema validation using Pydantic



---

🛠 Tech Stack

Frontend

React (Admin Panel)

React Native + Expo (Mobile App)

React Navigation

React Native Paper

Axios


Backend

Python

FastAPI

MongoDB

Pydantic

JWT Authentication


DevOps / Infra

Docker (planned)

Nginx (planned)

Redis (planned)

Socket.IO (planned)



---

⏳ Features In Progress / Planned

These are intentionally left out and planned for next iterations:

🔄 Real-time cart sync (Redis)

🔔 Live order updates (Socket.IO)

⭐ Product ratings & reviews

🔍 Advanced product filters

🖼 Image upload (currently using image URLs)

📦 Inventory stock tracking

🚀 CI/CD pipeline (Jenkins / GitHub Actions)



---

📂 Project Structure

AmazonClone-React-React-Native/
├── backend-fastapi/
├── amazon-admin/
├── mobile/
├── screenshot/
└── README.md


---

🧪 Local Setup (High Level)

Backend

cd backend-fastapi
pip install -r requirements.txt
uvicorn main:app --reload

Admin Panel

cd amazon-admin
npm install
npm start

Mobile App

cd mobile
npm install
npx expo start


---

🎯 Purpose of This Project

This project was built to:

Demonstrate real-world full-stack architecture

Show API design & frontend consumption

Practice scalable system thinking

Serve as a portfolio project for interviews



---

👨‍💻 Author

Sourav Mitra
Full-Stack Developer (React · React Native · FastAPI · MongoDB)
