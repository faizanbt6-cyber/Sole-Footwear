# SOLE Footwear — Premium E-Commerce & Admin Dashboard

A premium, full-stack e-commerce web application engineered at the intersection of performance and design. Built for high-end sneaker enthusiasts, it features interactive 3D product models, a sleek brutalist dark-mode aesthetic, complete cart functionality, and a secure administrative dashboard.

## 🚀 Live Demo & Deployments
- **Frontend & Backend**: Deployed on Railway

## ✨ Features

### 🛍️ Premium E-Commerce
- **Interactive 3D Viewer**: Browse and inspect sneaker models dynamically in 360 degrees using Three.js WebGL integration.
- **Custom Design System**: A sleek, brutalist dark-mode aesthetic built purely with vanilla CSS. Includes glassmorphism, fluid typography, smooth micro-animations, and a custom interactive cursor.
- **Dynamic Cart Management**: Complete add-to-cart logic, quantity adjustments, and local storage synchronization for a seamless shopping experience.
- **Smart Reviews System**: Users can view, scroll, and dynamically interact with product reviews.
- **Order Tracking**: Customers can track their package status in real-time using their order ID and email address.

### 🛡️ Admin Dashboard
- **Product Management**: Full CRUD operations to add, edit, or remove shoes from the live catalog.
- **Live Order Monitoring**: View and manage all incoming customer orders in real-time.
- **Fulfillment Operations**: Update tracking codes and transition order statuses (Processing, Shipped, Delivered).
- **Secure Access**: JWT role-based authentication ensures only authorized admin accounts (`admin@sole.com`) can access the dashboard and modify the database.

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | HTML5 & CSS3 | Pure Vanilla custom styling architecture (no external UI libraries) |
| | Vanilla JavaScript | Client-side logic, API communication, and dynamic DOM manipulation |
| | Three.js | WebGL library for rendering interactive 3D models |
| **Backend** | Node.js & Express | High-performance RESTful API server |
| | MongoDB (Atlas) | Cloud NoSQL database for persistent data storage |
| | Mongoose ODM | Object Data Modeling for elegant MongoDB interactions |
| | BCryptJS | Secure cryptographic password hashing |
| | JSON Web Tokens | Stateless, secure authentication and role authorization |
| | Cors | Cross-Origin Resource Sharing middleware |

## 📂 Project Structure

```text
SOLE-Footwear/
├── backend/
│   ├── config/           # Database connection configuration (db.js)
│   ├── controllers/      # Logic for API routes (auth, products, orders)
│   ├── models/           # Mongoose schemas (User, Product, Order, Review)
│   ├── routes/           # Express API endpoints
│   ├── server.js         # Backend Express server entry point
│   └── package.json      # Backend dependencies and startup scripts
├── frontend/
│   ├── assets/           # Images, 3D models (.glb), icons
│   ├── styles/           # Custom design system and responsive stylesheets
│   ├── js/               # Frontend logic (store.js, cart.js, auth.js, etc.)
│   └── *.html            # Application views (index, checkout, admin, etc.)
├── README.md             # Project documentation
└── package.json          # Root-level orchestrator and deployment scripts
```

## 💻 Local Setup

Run the application locally on your machine:

### 1. Prerequisites
- Node.js installed (v18 or v20 recommended).
- Git installed.
- A MongoDB cluster/URI string.

### 2. Clone the Repository
```bash
git clone https://github.com/Faizan-Fr-Dev/Sole-Footwear.git
cd Sole-Footwear
```

### 3. Install All Dependencies
Install the required packages. Our root `package.json` script will automatically handle the backend installations:
```bash
npm install
```

### 4. Set Up Environment Variables
Create a `.env` file inside the `backend` folder and add your connection strings:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

### 5. Run the Server
Start the Express server, which will automatically serve the API and the frontend UI:
```bash
npm start
```
Open `http://localhost:5000` in your browser to view the application.

## ☁️ Deployment

**Backend & Frontend (Railway)**
1. Link your GitHub repository to Railway.
2. In your Railway project, navigate to the **Variables** tab and add your Environment Variables (`MONGO_URI`, `JWT_SECRET`).
3. Add `NIXPACKS_NODE_VERSION` with a value of `20` to ensure compatibility with MongoDB's latest cryptographic requirements.
4. Do **NOT** set a `PORT` variable; Railway will dynamically map its own port automatically.
5. Railway will automatically detect the root `package.json` and deploy both the Node.js backend and the statically served frontend as a single robust application!

## 👤 Author

Designed and engineered with 💻 by **Faizan-Fr-Dev**
