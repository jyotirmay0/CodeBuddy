# CodeBuddy

**CodeBuddy** is a developer networking platform designed to help individuals find **project collaborators, coding partners, and developer buddies**.  
It connects like-minded developers through real-time interaction, enabling seamless collaboration and communication.

A live version of the backend is deployed on Render:  
**Server:** [https://codebuddy-server-pizy.onrender.com](https://codebuddy-server-pizy.onrender.com)  
**API Viewer:** [https://code-buddy-api-viewer.vercel.app/](https://code-buddy-api-viewer.vercel.app/)  
*(Ensure the server is active before accessing the API viewer for a smooth experience.)*

---

## Overview

CodeBuddy serves as a centralized platform for developers to:
- Discover other developers or groups based on shared interests and tech stacks  
- Collaborate through real-time chat and video calls  
- Build or join projects and communities in an interactive environment  

The app’s **Android client** is built using **Kotlin**, communicating with a robust **Express.js** backend that ensures speed, security, and scalability.

---

## Tech Stack

**Frontend (Mobile):** Kotlin  
**Backend:** Node.js (Express)  
**Database:** MongoDB, Redis  
**Real-time Communication:** Socket.IO, WebRTC  
**Authentication:** JWT and Cookies  
**Media Storage:** Cloudinary  

---

## Backend Architecture

#### 1. **User Authentication**
- JWT-based authentication for secure access  
- Cookies for maintaining persistent sessions  
- Redis used for storing and verifying OTPs during login and signup  

#### 2. **User & Buddy Management**
- MongoDB models for users, buddy requests, and connections  
- Efficient querying for user discovery and mutual connections  
- Cloudinary integration for profile image uploads  

#### 3. **Real-time Communication**
- Socket.IO enables real-time chat between users and groups  
- WebRTC integration for peer-to-peer video calls  
- Scalable signaling layer for establishing RTC connections  

#### 4. **API Structure**
- Modular Express routes with clear separation of controllers and middleware  
- Error-handling middleware for robust request validation  
- Consistent JSON response patterns for easy API consumption  

---

## Deployment & Setup

To run the server locally:

```bash
git clone https://github.com/SwarthakDas/CodeBuddy.git
cd server
npm install
npm start
````

The backend will start on the default configured port.
Ensure MongoDB, Redis, and Cloudinary credentials are properly configured in the environment variables.
