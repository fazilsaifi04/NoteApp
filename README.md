# 📝 NoteApp – MERN Stack Notes Application

A full-stack note-taking application with OTP-based email verification, secure authentication, and personal note management (create, edit, delete).

---

## 🚀 Features

- ✉️ **OTP-based Signup** – Email verification during registration
- 🔐 **Login/Logout** – JWT-based secure authentication
- 🗒️ **Note Management** – Create, edit, delete personal notes
- 📚 **MongoDB Atlas** – Cloud-based document database
- 🧾 **JWT Auth** – Token-based protected routes

---

## 🧩 Tech Stack

**Frontend:** React, Axios, TailwindCSS  
**Backend:** Node.js, Express, MongoDB, Mongoose  
**Auth:** JWT, Email OTP with Nodemailer  
**Deployment:** Localhost (can be deployed to Vercel/Render)

---

## 🔧 Prerequisites

- Node.js (v16+ recommended)
- MongoDB Atlas account
- Gmail account for Nodemailer (App Password if 2FA is enabled)
- Yarn or npm

---

## ⚙️ Backend Setup (`/server`)

1. **Navigate to the backend directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file in `/server`:**

   Here's an example `.env` template:

   ```env
   MAIL_HOST=smtp.gmail.com
   MAIL_USER=your_email@example.com
   MAIL_PASS=your_app_password

   JWT_SECRET=your_jwt_secret_key
   MONGODB_URL=your_mongodb_atlas_connection_string

   PORT=4000
   ```

   ✅ Make sure `.env` is listed in `.gitignore` to keep it private:
   ```
   .env
   ```

   🔐 Use Gmail App Passwords if 2FA is enabled:  
   [Generate App Password →](https://myaccount.google.com/apppasswords)

4. **Start the backend server:**
   ```bash
   npm start
   ```

   > API runs at: [http://localhost:4000](http://localhost:4000)

---

## 🌐 Frontend Setup (`/client`)

1. **Navigate to frontend directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Check your API configuration in `client/api/api.js`:**

   ```js
   import axios from "axios";

   const instance = axios.create({
     baseURL: "http://localhost:4000/api/v1",
     withCredentials: true,
   });

   export default instance;
   ```

4. **Start React app:**
   ```bash
   npm start
   ```

   > Frontend runs at: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Test the App

1. Visit: [http://localhost:3000/signup](http://localhost:3000/signup)
2. Fill in name, email, and DOB → click "Get OTP"
3. Enter the OTP sent to your email → complete signup
4. Login → Dashboard → Create/Edit/Delete your notes

---

## 🛡️ Environment Variables Summary

| Key           | Description                           |
|---------------|---------------------------------------|
| `MAIL_HOST`   | Mail server host (e.g., `smtp.gmail.com`) |
| `MAIL_USER`   | Your email address used to send OTPs |
| `MAIL_PASS`   | Your email app password (secure login) |
| `JWT_SECRET`  | Secret key for JWT signing           |
| `MONGODB_URL` | MongoDB Atlas connection URI         |
| `PORT`        | Backend server port (default: `4000`) |

---

## ✅ Tips

- If you're using Gmail for sending OTPs, make sure to [enable 2FA](https://myaccount.google.com/security) and generate an **App Password**.
- Always keep your `.env` file **private**. Never commit it to GitHub.

---

## 📦 Deployment

- You can deploy your **backend** to Render or Railway.
- You can deploy your **frontend** to Vercel or Netlify.
- Make sure to update your environment variables and CORS origins in production.

---

## 👨‍💻 Author

**Fazil Saifi**  
GitHub: [@fazilsaifi04](https://github.com/fazilsaifi04)

