# CampusFood – Smart Campus Food Ordering & Management Systems

**Customer, Vendor & Admin Web Application**

## Project Overview

CampusFood is a web-based food ordering system designed for a university campus environment.
The system connects **customers (students & staff)**, **vendors (cafeterias & food stalls)**, and **administrators** within a single integrated platform to streamline food ordering, order management, and system monitoring.

This project is developed for **academic and educational purposes**, focusing on usability, efficiency, and scalable system design.

---

## System Roles
  
### 🧑‍🎓 Customer Site

Customers can:

* Browse available food vendors on campus
* View menus and food details
* Add items to cart and place orders
* Track order status in real time
* View order history

---

### 🧑‍🍳 Vendor Site

Vendors can:

* Manage food menus (add, update, remove items)
* View incoming orders from customers
* Update order status (preparing, ready, completed)
* Monitor daily sales and order history

---

### 🛠️ Admin Site

Administrators can:

* Manage vendor accounts and approvals
* Monitor customer activity and orders
* View platform-wide analytics and statistics
* Control system settings and platform operations

---

## How to Edit This Project

You can edit and develop this project in multiple ways.

### Use Your Preferred IDE (Recommended)

#### Requirements

* Node.js
* npm (Node Package Manager)

Install Node.js using **nvm** if needed:
[https://github.com/nvm-sh/nvm#installing-and-updating](https://github.com/nvm-sh/nvm#installing-and-updating)

#### Run the Project Locally

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

The application will be accessible via the local URL shown in the terminal.

---

### Edit Directly on GitHub

* Open the file you want to edit
* Click the **Edit** icon
* Commit changes to save

---

### Use GitHub Codespaces

* Go to the repository main page
* Click **Code → Codespaces**
* Create a new Codespace
* Edit, commit, and push changes in the browser

---

## Technologies Used

This project is built using modern web technologies:

* Vite
* TypeScript
* React
* Tailwind CSS
* shadcn/ui

---

## System Architecture (High-Level)

* **Frontend**: React + Vite
* **Backend**: API-based architecture (RESTful services)
* **Database**: MongoDB (for users, vendors, menus, and orders)
* **Authentication**: Role-based access (Customer, Vendor, Admin)

---

## Deployment

The application can be deployed using platforms such as:

* Vercel
* Netlify
* GitHub Pages (frontend only)
* Cloud servers (full-stack deployment)

To build the project:

```sh
npm run build
```

Follow your chosen hosting provider’s deployment instructions.

---

## Academic Notice

This project is developed as part of an **academic course / university project**.
All data used is for **demonstration and learning purposes only**.
