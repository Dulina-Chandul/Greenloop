# Greenloop ♻️

**Greenloop** is a smart waste marketplace connecting waste generators to scrap collectors via reverse auctions. Built with the MERN stack and powered by Gemini AI, it features AI-based scrap recognition, real-time bidding, and geo-matching to streamline waste management and boost recycling efforts.

## 🚀 Key Features

- **Reverse Auctions:** Sellers list scrap, and collectors bid in real-time.
- **AI Scrap Recognition:** Automatically identifies scrap type and estimates value using **Google Gemini AI**.
- **Real-time Bidding:** Live bid updates powered by **Socket.io**.
- **Live Market Map:** Interactive map showing real-time listings and collector locations using **Leaflet**.
- **Geo-Matching:** Connects sellers with nearby collectors for efficient pickup.
- **Dashboards:** Dedicated analytics and management dashboards for both Sellers and Collectors.
- **Secure Authentication:** Robust user authentication using JWT.

## 🛠️ Tech Stack

### Frontend

- **Framework:** [React](https://react.dev/) (with [Vite](https://vitejs.dev/))
- **Language:** TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** Redux Toolkit, TanStack Query
- **UI Components:** Radix UI, Lucide React
- **Maps:** React Leaflet
- **HTTP Client:** Axios

### Backend

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- **Real-time:** Socket.io
- **AI:** Google Gemini API
- **Image Storage:** Cloudinary
- **Email:** Resend

## 📋 Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB (Local or Atlas)

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/greenloop.git
cd greenloop
```

### 2. Backend Setup

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory with the following variables:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
APP_ORIGIN=http://localhost:5173
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
EMAIL_SENDER=noreply@greenloop.com
RESEND_API_KEY=your_resend_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Frontend Setup

Navigate to the client directory and install dependencies:

```bash
cd ../client
npm install
```

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

## 🏃‍♂️ Running the Application

### Start the Backend Server

In the `server` directory:

```bash
npm run dev
```

The server will start on `http://localhost:5000`.

### Start the Frontend Client

In the `client` directory:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
