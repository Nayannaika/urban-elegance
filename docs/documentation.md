# Urban Elegance — Project Documentation

---

## 1. Introduction

Urban Elegance is a modern, full-stack e-commerce web application designed specifically for fashion retail. It provides a complete shopping experience for customers — from browsing curated clothing collections to placing orders, tracking deliveries, and requesting returns — while equipping administrators with a powerful dashboard to manage the entire business operation.

The platform is built using a decoupled architecture: an Angular 19 Single Page Application (SPA) serving as the frontend, backed by a Node.js/Express REST API and a MongoDB database. The system supports role-based access control, JWT-based authentication, product reviews, wishlists, cart management, order lifecycle management, promotional banners, blog content, and a rich analytics dashboard.

---

### 1.1 Existing System

Traditional online fashion retail stores are typically built using monolithic architectures (e.g., WordPress + WooCommerce or Magento). These systems:

- Rely on server-side rendered pages, causing full page reloads on navigation.
- Offer limited customisation without extensive plugin ecosystems.
- Have tightly coupled frontend and backend, making independent scaling difficult.
- Often lack real-time interactivity and modern UI/UX patterns.
- Provide basic admin panels with limited analytics capabilities.
- Have poor mobile responsiveness by default.
- Typically require paid plugins for features like wishlists, advanced filtering, or return management.

---

### 1.2 Limitations of the Existing System

| #   | Limitation                                                                                  |
| --- | ------------------------------------------------------------------------------------------- |
| 1   | Full-page reloads on every navigation degrades the user experience.                         |
| 2   | Monolithic architecture makes it difficult to scale the frontend and backend independently. |
| 3   | Limited real-time UI feedback (e.g., cart count, stock updates).                            |
| 4   | Analytics are often basic and require third-party plugins (paid).                           |
| 5   | Template-based themes restrict design flexibility and brand customisation.                  |
| 6   | Return/refund workflows are often manual and not digitised.                                 |
| 7   | No built-in Two-Factor Authentication (2FA) in most basic systems.                          |
| 8   | Admin activity is not logged or auditable.                                                  |
| 9   | No native blog/content management tailored to brand storytelling.                           |
| 10  | Poor API-first design limits mobile app development in the future.                          |

---

## 2. Proposed System

Urban Elegance addresses the above limitations through a modern, API-first, component-driven architecture. The frontend is an Angular SPA delivering a seamless, app-like experience. The backend is a stateless REST API built on Node.js/Express with MongoDB as the database. The system is modular, scalable, and designed with future expandability in mind.

---

### 2.1 Project Profile

| Field                       | Details                                                             |
| --------------------------- | ------------------------------------------------------------------- |
| **Project Name**            | Urban Elegance                                                      |
| **Project Type**            | Full-Stack E-Commerce Web Application                               |
| **Domain**                  | Fashion Retail                                                      |
| **Frontend Technology**     | Angular 19 (TypeScript, SCSS)                                       |
| **Backend Technology**      | Node.js with Express.js (TypeScript)                                |
| **Database**                | MongoDB (via Mongoose ODM)                                          |
| **Authentication**          | JWT (Access Token + Refresh Token), Two-Factor Authentication (2FA) |
| **Image Storage**           | Local filesystem (`/uploads` directory) via Multer                  |
| **API Architecture**        | RESTful API                                                         |
| **Development Environment** | Windows 11, VSCode                                                  |
| **Version Control**         | Git                                                                 |
| **Frontend Port**           | 4200                                                                |
| **Backend Port**            | 5000                                                                |
| **Package Manager**         | npm                                                                 |

---

### 2.2 Objective

The objective of Urban Elegance is to develop a fully functional, production-ready fashion e-commerce platform that:

1. **Provides a seamless shopping experience** — users can browse products by category, filter and search, view product details with images and reviews, add items to a wishlist, manage a shopping cart, and place orders.
2. **Implements a complete order lifecycle** — orders progress through statuses: Processing → Shipped → Delivered. Users may then initiate a return request, which admins can accept and mark as Returned, followed by a refund.
3. **Empowers administrators** — a secure, role-based admin dashboard provides full control over products, categories, banners, orders, users, blogs, and business analytics.
4. **Ensures security and trust** — JWT-based authentication with refresh tokens, optional Two-Factor Authentication, password reset via email tokens, and admin action logging.
5. **Delivers a modern, responsive UI** — Angular signals, reactive forms, and component-based design provide a fast, interactive single-page application experience.
6. **Enables content marketing** — an admin-managed blog system allows publishing fashion articles to engage customers.
7. **Provides business insights** — an analytics dashboard gives admins visibility into sales, revenue, user growth, and product performance.

---

### 2.3 Hardware and Software Requirements

#### Hardware Requirements

| Component     | Minimum Requirement                                              |
| ------------- | ---------------------------------------------------------------- |
| **Processor** | Intel Core i3 / AMD Ryzen 3 (or equivalent)                      |
| **RAM**       | 4 GB (8 GB recommended)                                          |
| **Storage**   | 10 GB free disk space                                            |
| **Network**   | Internet connection (for npm packages and MongoDB Atlas if used) |
| **Display**   | 1280 × 720 resolution minimum                                    |

#### Software Requirements

| Component              | Software / Version                           |
| ---------------------- | -------------------------------------------- |
| **Operating System**   | Windows 10/11, macOS, or Linux               |
| **Runtime**            | Node.js v20 LTS or later                     |
| **Package Manager**    | npm v10+                                     |
| **Frontend Framework** | Angular CLI v19+                             |
| **Database**           | MongoDB v6+ (local) or MongoDB Atlas (cloud) |
| **Browser**            | Google Chrome / Mozilla Firefox (latest)     |
| **IDE**                | Visual Studio Code                           |
| **Version Control**    | Git v2.40+                                   |
| **API Testing**        | Postman (recommended)                        |

---

## 3. System Design

### 3.1 System Level Diagram

The Urban Elegance system follows a **three-tier client-server architecture**:

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                              │
│    ┌──────────────────────────────────────────────────────┐     │
│    │           Angular 19 SPA (Port 4200)                 │     │
│    │  ┌─────────────┐  ┌──────────────┐  ┌────────────┐   │     │
│    │  │  User Pages │  │ Admin Pages  │  │  Auth Pages│   │     │
│    │  └─────────────┘  └──────────────┘  └────────────┘   │     │
│    └──────────────────────────────────────────────────────┘     │
└────────────────────────────┬────────────────────────────────────┘
                             │  HTTP/REST API (JSON)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION TIER                           │
│    ┌──────────────────────────────────────────────────────┐     │
│    │        Node.js + Express REST API (Port 5000)        │     │
│    │  ┌──────────┐  ┌──────────┐  ┌─────────────────┐     │     │
│    │  │ Routes   │  │Controllers│  │  Middleware    │     │     │
│    │  │ /users   │  │ Auth     │  │  JWT Auth       │     │     │
│    │  │ /products│  │ Products │  │  Role Guard     │     │     │
│    │  │ /orders  │  │ Orders   │  │  Error Handler  │     │     │
│    │  │ /cart    │  │ Cart     │  │  Multer Upload  │     │     │
│    │  └──────────┘  └──────────┘  └─────────────────┘     │     │
│    └──────────────────────────────────────────────────────┘     │
└────────────────────────────┬────────────────────────────────────┘
                             │  Mongoose ODM
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA TIER                                │
│    ┌──────────────────────────────────────────────────────┐     │
│    │                 MongoDB Database                     │     │
│    │  Users  Products  Orders  Cart  Wishlist  Payments   │     │
│    │  Reviews  Categories  Blogs  Banners  AdminLogs      │     │
│    └──────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

---

### 3.2 Data Flow Diagram

#### 3.2.1 Context Level DFD (Level 0)

The context-level DFD shows the system as a single process interacting with two primary external entities: the **Customer (User)** and the **Administrator**.

```
                    ┌──────────────────────────────────────────┐
                    │                                          │
  ┌──────────┐      │          URBAN ELEGANCE                  │      ┌──────────┐
  │          │─────►│           E-COMMERCE                     │◄─────│          │
  │  USER /  │      │             SYSTEM                       │      │  ADMIN   │
  │ CUSTOMER │◄─────│                                          │─────►│          │
  └──────────┘      │                                          │      └──────────┘
                    └──────────────────────────────────────────┘

  User Inputs:  Register, Login, Browse Products, Add to Cart,
                Place Order, Write Review, Request Return

  User Outputs: Product Listings, Order Confirmations, Order Status,
                Wishlist, Cart Contents, Receipt

  Admin Inputs: Manage Products, Manage Users, Update Order Status,
                Publish Blog, Upload Banner, View Analytics

  Admin Outputs: Dashboard Reports, User Lists, Order Queue,
                 Product Inventory, Admin Audit Logs
```

---

#### 3.2.2 Admin DFD (First Level)

```
                         ┌─────────────────────────────┐
                         │          ADMIN              │
                         └──────────────┬──────────────┘
                                        │
        ┌───────────────────────────────┼────────────────────────────────┐
        │                              │                                 │
        ▼                              ▼                                 ▼
┌───────────────┐            ┌────────────────┐               ┌──────────────────┐
│  1.0 Product  │            │  2.0 Order     │               │  3.0 User        │
│  Management   │            │  Management    │               │  Management      │
│               │            │                │               │                  │
│ - Add Product │            │ - View Orders  │               │ - View Users     │
│ - Edit/Delete │            │ - Ship Order   │               │ - Block/Unblock  │
│ - Set Featured│            │ - Mark Delivrd │               │ - View Details   │
│ - Manage Cats │            │ - Accept Return│               └──────────────────┘
└───────┬───────┘            │ - Refund       │
        │                    └───────┬────────┘
        ▼                            ▼
  ┌──────────┐               ┌──────────────┐
  │ Products │               │   Orders     │
  │   DB     │               │     DB       │
  └──────────┘               └──────────────┘

        ┌──────────────────────────────────┐
        │                                  │
        ▼                                  ▼
┌───────────────┐                 ┌───────────────── ┐
│  4.0 Content  │                 │  5.0 Analytics   │
│  Management   │                 │  Dashboard       │
│               │                 │                  │
│ - Blogs       │                 │ - Revenue Stats  │
│ - Banners     │                 │ - User Growth    │
│ - Categories  │                 │ - Top Products   │
└───────┬───────┘                 │ - Order Trends   │
        │                         └──────────────────┘
        ▼
  ┌──────────┐
  │ Blogs /  │
  │ Banners  │
  │    DB    │
  └──────────┘
```

---

#### 3.2.3 User DFD (First Level)

```
                         ┌─────────────────────────────┐
                         │           USER              │
                         └──────────────┬──────────────┘
                                        │
        ┌───────────────────────────────┼────────────────────────────────┐
        │                              │                                 │
        ▼                              ▼                                 ▼
┌───────────────┐            ┌────────────────┐               ┌──────────────────┐
│  1.0 Auth     │            │  2.0 Product   │               │  3.0 Cart &      │
│               │            │  Browsing      │               │  Checkout        │
│ - Register    │            │                │               │                  │
│ - Login       │            │ - View Products│               │ - Add to Cart    │
│ - 2FA         │            │ - Filter/Search│               │ - Update Qty     │
│ - Forgot Pass │            │ - View Details │               │ - Place Order    │
│ - Refresh JWT │            │ - Read Reviews │               │ - Choose Payment │
└───────┬───────┘            └───────┬────────┘               └────────┬─────────┘
        │                            │                                  │
        ▼                            ▼                                  ▼
  ┌──────────┐               ┌──────────────┐                   ┌──────────────┐
  │  Users   │               │   Products   │                   │   Orders /   │
  │    DB    │               │     DB       │                   │   Cart DB    │
  └──────────┘               └──────────────┘                   └──────────────┘

        ┌──────────────────────────────────┐
        │                                  │
        ▼                                  ▼
┌───────────────┐                 ┌─────────────────┐
│  4.0 Wishlist │                 │  5.0 Profile &  │
│  & Reviews    │                 │  Orders Mgmt    │
│               │                 │                 │
│ - Add to      │                 │ - View Profile  │
│   Wishlist    │                 │ - Edit Address  │
│ - Remove      │                 │ - View Orders   │
│ - Write Review│                 │ - Request Return│
│ - Rate Product│                 │ - Track Status  │
└───────┬───────┘                 └─────────────────┘
        │
        ▼
  ┌──────────┐
  │ Wishlist │
  │ Reviews  │
  │    DB    │
  └──────────┘
```

---

### 3.3 Data Dictionary

The data dictionary defines all collections (tables) in the MongoDB database, their fields, types, and constraints.

---

#### Collection: `users`

| Field                   | Data Type | Constraints                                  | Description                           |
| ----------------------- | --------- | -------------------------------------------- | ------------------------------------- |
| `_id`                   | ObjectId  | Primary Key, Auto-generated                  | Unique user identifier                |
| `name`                  | String    | Required                                     | Full name of the user                 |
| `email`                 | String    | Required, Unique                             | User's email address (used for login) |
| `passwordHash`          | String    | Required                                     | Bcrypt-hashed password                |
| `role`                  | String    | Enum: `user`, `admin`; Default: `user`       | Access role                           |
| `status`                | String    | Enum: `active`, `blocked`; Default: `active` | Account status                        |
| `phone`                 | String    | Optional                                     | Contact phone number                  |
| `deviceIp`              | String    | Optional                                     | Last known IP address                 |
| `refreshToken`          | String    | Optional                                     | JWT refresh token for session renewal |
| `isTwoFactorEnabled`    | Boolean   | Default: `false`                             | Whether 2FA is active                 |
| `twoFactorSecret`       | String    | Optional                                     | TOTP secret key for 2FA               |
| `addresses`             | Array     | Optional                                     | Embedded array of shipping addresses  |
| `addresses.street`      | String    | —                                            | Street address                        |
| `addresses.city`        | String    | —                                            | City                                  |
| `addresses.state`       | String    | —                                            | State / Province                      |
| `addresses.zip`         | String    | —                                            | Postal code                           |
| `addresses.country`     | String    | —                                            | Country                               |
| `addresses.isDefault`   | Boolean   | Default: `false`                             | Whether this is the default address   |
| `savedCards`            | Array     | Optional                                     | Masked saved payment card details     |
| `savedCards.cardHolder` | String    | —                                            | Name on card                          |
| `savedCards.last4`      | String    | —                                            | Last 4 digits                         |
| `savedCards.expiry`     | String    | —                                            | Expiry date (MM/YY)                   |
| `savedCards.brand`      | String    | —                                            | Card brand (Visa, Mastercard, etc.)   |
| `savedCards.isDefault`  | Boolean   | Default: `false`                             | Default card flag                     |
| `giftCardBalance`       | Number    | Default: `0`                                 | Gift card/wallet balance in INR       |
| `resetPasswordToken`    | String    | Optional                                     | Token for password reset flow         |
| `resetPasswordExpires`  | Date      | Optional                                     | Expiry timestamp for reset token      |
| `createdAt`             | Date      | Auto-generated                               | Account creation timestamp            |
| `updatedAt`             | Date      | Auto-generated                               | Last profile update timestamp         |

---

#### Collection: `products`

| Field             | Data Type | Constraints                 | Description                           |
| ----------------- | --------- | --------------------------- | ------------------------------------- |
| `_id`             | ObjectId  | Primary Key                 | Unique product identifier             |
| `name`            | String    | Required                    | Product name                          |
| `description`     | String    | Required                    | Detailed product description          |
| `price`           | Number    | Required, Default: `0`      | Price in INR                          |
| `category`        | ObjectId  | Required, Ref: `categories` | Category the product belongs to       |
| `images`          | String[]  | —                           | Array of image URLs/paths             |
| `stock`           | Number    | Required, Default: `0`      | Available inventory count             |
| `sizes`           | String[]  | —                           | Available sizes (e.g., S, M, L, XL)   |
| `colors`          | String[]  | —                           | Available color options               |
| `brand`           | String    | Optional                    | Brand name                            |
| `isFeatured`      | Boolean   | Default: `false`            | Whether shown in featured section     |
| `isNewArrival`    | Boolean   | Default: `false`            | Whether shown in new arrivals         |
| `reviews`         | Array     | Embedded                    | Array of embedded review subdocuments |
| `reviews.user`    | ObjectId  | Ref: `users`                | Reviewer's user ID                    |
| `reviews.name`    | String    | Required                    | Reviewer's name                       |
| `reviews.rating`  | Number    | Required                    | Rating value (1–5)                    |
| `reviews.comment` | String    | Required                    | Review text                           |
| `rating`          | Number    | Default: `0`                | Computed average rating               |
| `numReviews`      | Number    | Default: `0`                | Total review count                    |
| `createdAt`       | Date      | Auto-generated              | Product created timestamp             |
| `updatedAt`       | Date      | Auto-generated              | Product updated timestamp             |

---

#### Collection: `categories`

| Field         | Data Type | Constraints      | Description                         |
| ------------- | --------- | ---------------- | ----------------------------------- |
| `_id`         | ObjectId  | Primary Key      | Unique category identifier          |
| `name`        | String    | Required, Unique | Category name (e.g., Tops, Dresses) |
| `description` | String    | Optional         | Short category description          |
| `image`       | String    | Default: `""`    | Category banner image URL           |
| `createdAt`   | Date      | Auto-generated   | Created timestamp                   |
| `updatedAt`   | Date      | Auto-generated   | Updated timestamp                   |

---

#### Collection: `orders`

| Field                     | Data Type | Constraints                                                                        | Description                   |
| ------------------------- | --------- | ---------------------------------------------------------------------------------- | ----------------------------- |
| `_id`                     | ObjectId  | Primary Key                                                                        | Unique order identifier       |
| `user`                    | ObjectId  | Required, Ref: `users`                                                             | Customer who placed the order |
| `orderItems`              | Array     | —                                                                                  | List of ordered products      |
| `orderItems.product`      | ObjectId  | Required, Ref: `products`                                                          | Product reference             |
| `orderItems.name`         | String    | Required                                                                           | Product name at time of order |
| `orderItems.image`        | String    | —                                                                                  | Product image URL             |
| `orderItems.price`        | Number    | Required                                                                           | Unit price at time of order   |
| `orderItems.quantity`     | Number    | Required                                                                           | Quantity ordered              |
| `orderItems.size`         | String    | Optional                                                                           | Selected size variant         |
| `shippingAddress`         | Object    | Required                                                                           | Delivery address              |
| `shippingAddress.street`  | String    | Required                                                                           | Street                        |
| `shippingAddress.city`    | String    | Required                                                                           | City                          |
| `shippingAddress.state`   | String    | Required                                                                           | State                         |
| `shippingAddress.zip`     | String    | Required                                                                           | Zip code                      |
| `shippingAddress.country` | String    | Required                                                                           | Country                       |
| `paymentMethod`           | String    | Default: `Cash on Delivery`                                                        | Payment method used           |
| `itemsPrice`              | Number    | Required, Default: `0`                                                             | Total product subtotal        |
| `taxPrice`                | Number    | Required, Default: `0`                                                             | Tax applied                   |
| `shippingPrice`           | Number    | Required, Default: `0`                                                             | Shipping charges              |
| `totalPrice`              | Number    | Required, Default: `0`                                                             | Grand total                   |
| `isPaid`                  | Boolean   | Default: `false`                                                                   | Payment completion flag       |
| `paidAt`                  | Date      | Optional                                                                           | When payment was confirmed    |
| `isDelivered`             | Boolean   | Default: `false`                                                                   | Delivery completion flag      |
| `deliveredAt`             | Date      | Optional                                                                           | When order was delivered      |
| `status`                  | String    | Enum: Pending, Processing, Shipped, Delivered, Cancelled, Return Request, Returned | Current order status          |
| `createdAt`               | Date      | Auto-generated                                                                     | Order placed timestamp        |
| `updatedAt`               | Date      | Auto-generated                                                                     | Last status update timestamp  |

---

#### Collection: `carts`

| Field            | Data Type | Constraints                    | Description            |
| ---------------- | --------- | ------------------------------ | ---------------------- |
| `_id`            | ObjectId  | Primary Key                    | Unique cart identifier |
| `user`           | ObjectId  | Required, Unique, Ref: `users` | One cart per user      |
| `items`          | Array     | —                              | Cart line items        |
| `items.product`  | ObjectId  | Required, Ref: `products`      | Product reference      |
| `items.quantity` | Number    | Required, Default: `1`         | Quantity of this item  |
| `items.size`     | String    | Optional                       | Selected size          |
| `createdAt`      | Date      | Auto-generated                 | Cart created timestamp |
| `updatedAt`      | Date      | Auto-generated                 | Last updated timestamp |

---

#### Collection: `wishlists`

| Field       | Data Type  | Constraints                    | Description                     |
| ----------- | ---------- | ------------------------------ | ------------------------------- |
| `_id`       | ObjectId   | Primary Key                    | Unique wishlist identifier      |
| `user`      | ObjectId   | Required, Unique, Ref: `users` | One wishlist per user           |
| `products`  | ObjectId[] | Ref: `products`                | Array of wishlisted product IDs |
| `createdAt` | Date       | Auto-generated                 | Wishlist created timestamp      |
| `updatedAt` | Date       | Auto-generated                 | Last updated timestamp          |

---

#### Collection: `reviews`

| Field       | Data Type | Constraints               | Description              |
| ----------- | --------- | ------------------------- | ------------------------ |
| `_id`       | ObjectId  | Primary Key               | Unique review identifier |
| `user`      | ObjectId  | Required, Ref: `users`    | Author of the review     |
| `product`   | ObjectId  | Required, Ref: `products` | Reviewed product         |
| `rating`    | Number    | Required, Min: 1, Max: 5  | Star rating              |
| `comment`   | String    | Required                  | Review text body         |
| `createdAt` | Date      | Auto-generated            | Review posted timestamp  |
| `updatedAt` | Date      | Auto-generated            | Review updated timestamp |

---

#### Collection: `payments`

| Field           | Data Type | Constraints                                                | Description                             |
| --------------- | --------- | ---------------------------------------------------------- | --------------------------------------- |
| `_id`           | ObjectId  | Primary Key                                                | Unique payment record identifier        |
| `user`          | ObjectId  | Required, Ref: `users`                                     | User who made the payment               |
| `order`         | ObjectId  | Required, Ref: `orders`                                    | Associated order                        |
| `amount`        | Number    | Required                                                   | Total amount paid                       |
| `method`        | String    | Default: `Cash on Delivery`                                | Payment method                          |
| `status`        | String    | Enum: `pending`, `completed`, `failed`; Default: `pending` | Payment status                          |
| `transactionId` | String    | Optional                                                   | External payment gateway transaction ID |
| `createdAt`     | Date      | Auto-generated                                             | Payment initiated timestamp             |
| `updatedAt`     | Date      | Auto-generated                                             | Payment status updated timestamp        |

---

#### Collection: `blogs`

| Field         | Data Type | Constraints            | Description                                     |
| ------------- | --------- | ---------------------- | ----------------------------------------------- |
| `_id`         | ObjectId  | Primary Key            | Unique blog post identifier                     |
| `title`       | String    | Required, Trimmed      | Blog post title                                 |
| `slug`        | String    | Required, Unique       | URL-friendly identifier (e.g., `my-first-post`) |
| `content`     | String    | Required               | Full HTML/markdown blog content                 |
| `author`      | ObjectId  | Required, Ref: `users` | Admin who authored the post                     |
| `tags`        | String[]  | Optional               | Tags for categorisation                         |
| `coverImage`  | String    | Optional               | URL to the cover image                          |
| `isPublished` | Boolean   | Default: `false`       | Whether the post is visible to users            |
| `createdAt`   | Date      | Auto-generated         | Post created timestamp                          |
| `updatedAt`   | Date      | Auto-generated         | Post updated timestamp                          |

---

#### Collection: `banners`

| Field       | Data Type | Constraints     | Description                         |
| ----------- | --------- | --------------- | ----------------------------------- |
| `_id`       | ObjectId  | Primary Key     | Unique banner identifier            |
| `imageUrl`  | String    | Required        | URL to the banner image             |
| `link`      | String    | Optional        | Redirect URL when banner is clicked |
| `isActive`  | Boolean   | Default: `true` | Whether banner is shown on homepage |
| `order`     | Number    | Default: `0`    | Display order/priority              |
| `createdAt` | Date      | Auto-generated  | Banner created timestamp            |
| `updatedAt` | Date      | Auto-generated  | Banner updated timestamp            |

---

#### Collection: `adminlogs`

| Field       | Data Type | Constraints            | Description                         |
| ----------- | --------- | ---------------------- | ----------------------------------- |
| `_id`       | ObjectId  | Primary Key            | Unique log entry identifier         |
| `adminId`   | ObjectId  | Required, Ref: `users` | Admin who performed the action      |
| `action`    | String    | Required               | Description of the action performed |
| `endpoint`  | String    | Required               | API endpoint that was called        |
| `ipAddress` | String    | Optional               | IP address of the admin at the time |
| `details`   | String    | Optional               | Additional context or data          |
| `createdAt` | Date      | Auto-generated         | When the action occurred            |

---

### 3.4 Data Tables

Urban Elegance uses **MongoDB**, a NoSQL document-oriented database, with **Mongoose** as the ODM (Object Document Mapper). Instead of traditional SQL tables, MongoDB stores data as collections of BSON documents.

The project defines **11 collections** in total:

- **`users`** — Stores all registered users and admin accounts. Contains embedded sub-documents for shipping addresses and saved card metadata. Supports 2FA and password reset token fields natively.
- **`products`** — The core product catalogue. Every product belongs to a category and contains embedded reviews as subdocuments. Supports multi-image, multi-size, and multi-color variants.
- **`categories`** — Taxonomic grouping for products (e.g., Tops, Dresses, Accessories). Referenced by the product collection.
- **`orders`** — Full order records including an array of ordered items (snapshot of product data at the time of purchase), shipping address, pricing breakdown, and a status lifecycle field.
- **`carts`** — A persistent shopping cart per user. Maintains product references and selected size variants between sessions.
- **`wishlists`** — A per-user collection of saved product IDs. Used by the wishlist feature to track user interest.
- **`reviews`** — Standalone review documents linked to both a user and a product. Used in addition to the embedded reviews in the product document.
- **`payments`** — Records payment transactions associated with orders. Tracks payment method, status, and optional transaction IDs for gateway integrations.
- **`blogs`** — Blog posts authored by admins, with rich content, tags, and publish/unpublish toggling for content marketing.
- **`banners`** — Promotional homepage banner images with optional links and display ordering for admin-controlled marketing.
- **`adminlogs`** — An audit trail of all significant admin actions, including the endpoint accessed, IP address, and action description, for security and accountability.

---

## 4. Future Enhancement

The following enhancements are planned or recommended for future versions of the Urban Elegance platform:

1. **Payment Gateway Integration** — Integrate Razorpay, Stripe, or PayU to support real online payments (UPI, credit/debit cards, net banking) instead of relying solely on Cash on Delivery.

2. **Mobile Application** — Develop native Android/iOS apps using Angular Ionic or React Native, leveraging the existing REST API backend without any backend changes.

3. **Real-Time Order Tracking** — Implement WebSocket (Socket.io) based real-time notifications for order status updates, instantly alerting customers when their order is shipped or delivered.

4. **AI-Powered Product Recommendations** — Integrate a recommendation engine to suggest products based on browsing history, purchase history, and collaborative filtering from similar users.

5. **Advanced Search with Elasticsearch** — Replace basic MongoDB text search with Elasticsearch for fast, typo-tolerant, faceted product search with auto-complete suggestions.

6. **Loyalty & Rewards Program** — Introduce a points-based rewards system where customers earn points on purchases that can be redeemed as discounts on future orders.

7. **Multi-Vendor Marketplace** — Expand the platform to allow multiple brands or vendors to register, list their own products, and manage their sales through a dedicated vendor dashboard.

8. **Email Notification System** — Implement transactional email notifications (via Nodemailer + SendGrid/Mailgun) for order confirmations, dispatch alerts, return updates, and promotional campaigns.

9. **Product Size Guide & Virtual Try-On** — Implement an interactive size guide and explore AR-based virtual try-on capabilities using WebAR or integration with third-party fashion AR APIs.

10. **Coupon & Discount Engine** — Add a flexible coupon code system supporting percentage discounts, flat discounts, minimum order value conditions, and limited-use coupons.

11. **Inventory Alerts & Restock Notifications** — Allow users to subscribe to "Notify Me" alerts for out-of-stock products, and alert admins when stock falls below a configurable threshold.

12. **Progressive Web App (PWA)** — Add Angular PWA capabilities (service workers, offline mode, home screen install) for an app-like experience on mobile browsers without requiring a download.

---

## 5. Conclusion

Urban Elegance is a comprehensive, modern fashion e-commerce platform that successfully addresses the limitations of traditional monolithic online stores. By adopting a decoupled architecture with Angular 19 on the frontend and a Node.js/Express REST API on the backend, the system achieves high performance, scalability, and developer flexibility.

The platform delivers a complete shopping lifecycle — from product discovery and cart management to order placement, delivery tracking, and returns — while providing administrators with a rich dashboard for managing every aspect of the business. Security is prioritised through JWT-based authentication, Two-Factor Authentication, and a full admin audit log.

The technology choices (Angular, Node.js, MongoDB) position the project well for future feature development, including mobile apps, payment gateway integrations, and AI-powered personalization. Urban Elegance demonstrates that a well-architected full-stack web application can deliver a premium, enterprise-grade retail experience even in an academic project context.

---

## 6. References

| #   | Reference                                                                                                   |
| --- | ----------------------------------------------------------------------------------------------------------- |
| 1   | **Angular Documentation** — Official Angular 19 framework guide. https://angular.dev                        |
| 2   | **Node.js Documentation** — Official Node.js runtime documentation. https://nodejs.org/en/docs              |
| 3   | **Express.js** — Fast, minimalist web framework for Node.js. https://expressjs.com                          |
| 4   | **MongoDB Documentation** — Official MongoDB manual and API references. https://www.mongodb.com/docs        |
| 5   | **Mongoose ODM** — Mongoose schema documentation and API guide. https://mongoosejs.com/docs                 |
| 6   | **TypeScript** — TypeScript language reference and handbook. https://www.typescriptlang.org/docs            |
| 7   | **JSON Web Tokens (JWT)** — JWT specification (RFC 7519) and auth best practices. https://jwt.io            |
| 8   | **Multer** — Node.js middleware for `multipart/form-data` file uploads. https://github.com/expressjs/multer |
| 9   | **Bcrypt.js** — Password hashing library for Node.js. https://www.npmjs.com/package/bcryptjs                |
| 10  | **Angular Signals** — Angular's reactive primitives for state management. https://angular.dev/guide/signals |
| 11  | **RxJS** — Reactive Extensions for JavaScript, used for async data streams in Angular. https://rxjs.dev     |
| 12  | **OWASP Top 10** — Web application security best practices reference. https://owasp.org/www-project-top-ten |
| 13  | **draw.io / diagrams.net** — Diagramming tool used for system and DFD diagrams. https://app.diagrams.net    |
| 14  | **npm Registry** — Node Package Manager for managing project dependencies. https://www.npmjs.com            |
| 15  | **MDN Web Docs** — Web standards and HTML/CSS/JavaScript reference. https://developer.mozilla.org           |

---
