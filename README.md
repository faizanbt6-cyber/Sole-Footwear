# SOLE Footwear 👟

SOLE is a premium, full-stack e-commerce web application engineered at the intersection of performance and design. Built for high-end sneaker enthusiasts, it features interactive 3D product models, a sleek brutalist dark-mode aesthetic, and a fully functional administrative dashboard.

## 🌟 Key Features

### Frontend (Client-Side)
- **Interactive 3D Shoe Viewer**: Implemented using Three.js, allowing users to rotate and inspect sneaker models dynamically.
- **Custom Design System**: A premium dark-mode aesthetic built purely with vanilla CSS (no Tailwind), utilizing glassmorphism, fluid typography, and custom animations.
- **Dynamic Cart Management**: Complete add-to-cart logic with local storage synchronization.
- **Smart Reviews System**: Users can view, scroll, and add product reviews.
- **Custom UI Elements**: A globally injected custom cursor and micro-interactions for a highly polished feel.

### Backend (Server-Side)
- **Node.js & Express API**: Robust RESTful architecture handling all data operations.
- **MongoDB Database**: Persistent storage for products, orders, user accounts, and reviews.
- **JWT Authentication**: Secure user login, registration, and role-based access control (Admin vs User).
- **Admin Dashboard**: A secure portal where admins can:
  - Add and delete shoes from the catalog.
  - View live incoming customer orders.
  - Update tracking codes and order statuses (Processing, Shipped, Delivered).

## 💻 Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript, Three.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT), bcryptjs
- **Deployment**: Railway / Render compatible

## 🚀 Getting Started

To run this project locally on your machine, follow these steps:

### Prerequisites
- Node.js (v18 or higher recommended)
- A MongoDB URI connection string

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Sole-Footwear.git
   cd Sole-Footwear
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   *(Note: Our custom `package.json` install script will automatically CD into the backend folder and install the necessary Node modules.)*

3. **Set up Environment Variables**
   Create a `.env` file inside the `backend` folder and add the following keys:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   ```

4. **Run the Application**
   ```bash
   npm start
   ```

5. **View in Browser**
   Open your browser and navigate to `http://localhost:5000`. The Express server automatically serves the frontend static files!

## 🔐 Admin Access
To access the `/admin.html` dashboard, you must register a user account with the email `admin@sole.com`. The system will automatically grant this account admin privileges.

---
*Designed and engineered by Faizan-Fr-Dev.*
