# Urban Elegance 👗✨

**Urban Elegance** is a modern, high-performance, full-stack e-commerce platform designed for the fashion industry. It offers a seamless shopping experience for customers and a robust management system for administrators.

![Urban Elegance Banner](frontend/public/assets/banners/men-fashion-hero.png)

---

## 🚀 Overview

Urban Elegance is built using a decoupled architecture, featuring a responsive **Angular 19** frontend and a powerful **Node.js/Express** backend with **MongoDB**. This project bridges the gap between premium fashion retailing and cutting-edge web technology.

### Key Highlights:
- **Fast & Responsive**: Single Page Application (SPA) for app-like speed.
- **Secure**: JWT-based authentication with 2FA support.
- **Feature-Rich**: Wishlists, product reviews, blog system, and comprehensive analytics.
- **Admin Control**: Full dashboard for managing products, orders, and business metrics.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Angular 19 (TypeScript)
- **State Management**: Angular Signals
- **Styling**: SCSS / Vanilla CSS / Tailwind CSS(majorly used)
- **Interactivity**: RxJS

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (TypeScript)
- **Database**: MongoDB (via Mongoose ODM)
- **Auth**: JWT (Access + Refresh Tokens) + Bcrypt.js
- **File Uploads**: Multer

### Tools & DevOps
- **Version Control**: Git
- **Package Manager**: npm
- **API Documentation**: [Available in docs/documentation.md](docs/documentation.md)

---

## ✨ Core Features

### 🛍️ Customer Experience
- **Smart Browsing**: Filter by category, size, color, and price.
- **Persistent Cart**: Save items for later across sessions.
- **Wishlist**: Track your favorite fashion pieces.
- **Real-Time Reviews**: Share feedback and view product ratings.
- **Order Tracking**: Monitor your order lifecycle from processing to delivery.
- **Secure Returns**: Simple, digitized return request workflow.

### 🛡️ Admin Dashboard
- **Inventory Management**: Full CRUD operations for products and categories.
- **Order Lifecycle**: Manage status updates, shipments, and returns.
- **Marketing Tools**: Change homepage banners and publish blog posts.
- **Security Logs**: Audit trail of all administrative actions.
- **Business Analytics**: Track revenue, user growth, and top-selling products.

---

## 🏗️ Architecture

Urban Elegance follows a clean **Three-Tier Architecture**:
1.  **Client Tier**: Angular SPA providing the interactive user interface.
2.  **Application Tier**: Node.js/Express REST API handling business logic and security.
3.  **Data Tier**: MongoDB (NoSQL) for flexible and scalable data storage.

---

## 🚦 Getting Started

### Prerequisites
- **Node.js**: v20 LTS or later
- **MongoDB**: Local instance or MongoDB Atlas URI
- **npm**: v10+

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Nayannaika/urban-elegance.git
    cd urban-elegance
    ```

2.  **Setup Backend**
    ```bash
    cd backend
    npm install
    # Create a .env file based on .env.example (if available)
    # Create the initial admin (required for admin dashboard)
    npx tsx src/seed.ts
    npm run dev
    ```

3.  **Setup Frontend**
    ```bash
    cd ../frontend
    npm install
    npm start
    ```

4.  **Access the Application**
    - Frontend: `http://localhost:4200`
    - Backend API: `http://localhost:5000`

---

## 📂 Project Structure

```text
urban-elegance/
├── backend/            # Express API source code
│   ├── src/            # Controllers, Models, Routes, Middleware
│   ├── uploads/        # Local storage for images
│   └── ...
├── frontend/           # Angular source code
│   ├── src/            # Components, Services, Guards, Assets
│   └── ...
└── docs/               # Detailed technical documentation
```

---

## 🗺️ Roadmap
- [ ] Integration with Razorpay/Stripe for online payments.
- [ ] AI-Powered product recommendations.
- [ ] Real-time order tracking via WebSockets.
- [ ] Mobile Application (Ionic/React Native).
- [ ] Progressive Web App (PWA) support.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Developed with ❤️ by [Nayan Naika]
