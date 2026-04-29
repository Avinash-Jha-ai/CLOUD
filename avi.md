# ☁️ CLOUDAVI (MERN Stack Cloud Storage)
A premium, full-stack cloud storage platform built using the MERN stack, featuring a high-fidelity glassmorphism UI, secure file management, and tiered storage subscription plans.

💡 **Development Note**: The backend architecture and logic were custom-engineered from scratch to handle secure file processing and storage limits, while the frontend user interface and components were developed with significant AI assistance to achieve a sleek, premium tech aesthetic.

🔗 **Live Demo**: [https://cloud-nine-dusky.vercel.app/](https://cloud-nine-dusky.vercel.app/)

🔗 **Backend API**: [https://cloud-dr9e.vercel.app/](https://cloud-dr9e.vercel.app/)

💻 **GitHub Repo**: [https://github.com/Avinash-Jha-ai/CLOUD](https://github.com/Avinash-Jha-ai/CLOUD)

## 🚀 Features

*   🔐 **Google OAuth 2.0**: Secure, passwordless authentication using Google Social Login.
*   📦 **Advanced File Management**: Full CRUD operations for files and folders.
*   📤 **Multi-File Uploads**: Support for simultaneous uploading of multiple files with custom naming.
*   🖼️ **Intelligent File Viewer**: Sophisticated "off-canvas" previewer for images, videos, PDFs, and code files (JS, CSS, HTML, Python, etc.).
*   🧱 **Responsive Masonry Grid**: Adaptive file layout that looks stunning on all device sizes.
*   💳 **Razorpay Payment Integration**: Seamless subscription flow for upgrading storage tiers.
*   📊 **Real-time Storage Tracking**: Dynamic storage usage bar and percentage indicators.
*   📂 **Hierarchical Folder Structure**: Nested folders with customizable color coding.
*   🎨 **Modern UX/UI**: High-fidelity glassmorphism design with Dark/Light mode support and Framer Motion animations.

## 🛠️ Tech Stack

### Frontend
*   **React.js (Vite)**
*   **Redux Toolkit** (Global State Management)
*   **Framer Motion** (Fluid Animations)
*   **Lucide React** (Premium Iconography)
*   **Vanilla CSS** (Custom Design Tokens)

### Backend
*   **Node.js**
*   **Express.js** (REST API)
*   **JWT** (Secure Session Management)

### Database & Storage
*   **MongoDB (Mongoose ODM)**
*   **Cloudinary** (Cloud-based Media Storage)

### Other Tools
*   **Razorpay** (Payment Gateway)
*   **Firebase Auth** (Social Login Provider)
*   **Multer** (Buffer-based File Handling)
*   **Git & GitHub**

## 📂 Project Structure

```text
CLOUD/
│
├── backend/
│   ├── src/
│   │   ├── configs/        # Database & Environment configurations
│   │   ├── controllers/    # Business logic (Auth, File, Folder, Plan, Payment)
│   │   ├── middlewares/    # Auth verification & file upload handlers
│   │   ├── models/         # Mongoose Schemas (User, File, Folder)
│   │   ├── routes/         # REST API Endpoints
│   │   ├── services/       # Cloudinary & Storage integrations
│   │   └── utils/          # Helper utilities (File types, Storage calculations)
│   ├── app.js              # Express app initialization
│   └── server.js           # Production entry point
│
└── frontend/
    ├── src/
    │   ├── components/     # UI Components (DriveView, Navbar, FileViewer)
    │   ├── features/       # Redux Slices (Auth, Drive, Theme)
    │   ├── pages/          # Main Pages (Home, Dashboard, Plans)
    │   ├── services/       # Firebase & API configurations
    │   └── index.css       # Global Design System & Variables
    └── main.jsx            # React entry point
```

## ⚙️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Avinash-Jha-ai/CLOUD.git
    cd CLOUD
    ```

2.  **Install dependencies**
    ```bash
    # Setup backend
    cd backend
    npm install

    # Setup frontend
    cd ../frontend
    npm install
    ```

3.  **Setup Environment Variables**
    Create a `.env` file in the **backend** folder:
    ```env
    PORT=3000
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    RAZORPAY_KEY_ID=your_razorpay_id
    RAZORPAY_KEY_SECRET=your_razorpay_secret
    FRONTEND_URL=http://localhost:5173
    ```

    Create a `.env` file in the **frontend** folder:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    VITE_BACKEND_URL=http://localhost:3000
    ```

4.  **Run the project**
    ```bash
    # Backend (from backend folder)
    npm run dev

    # Frontend (from frontend folder)
    npm run dev
    ```

## 📚 What I Learned

*   **Secure File Handling**: Implementing buffer-based uploads to Cloudinary without local storage overhead.
*   **Tiered Authorization**: Enforcing storage limits at the API level based on user subscription tiers (1GB / 10GB / 100GB).
*   **Mobile-First Responsiveness**: Designing complex UI (like Masonry grids and off-canvas sidebars) that adapt fluidly to small viewports.
*   **Global State Synchronization**: Coordinating Redux state updates across independent slices (e.g., updating storage used in `authSlice` after a successful `driveSlice` upload).

## 🔮 Future Improvements

*   💬 **Real-time Collaboration**: Shared folders with permission-based access.
*   🔔 **Activity Logs**: Detailed history of file modifications and access.
*   🔍 **Advanced Search**: Full-text search and filtering by file extensions.
*   ⚡ **Offline Support**: PWA capabilities for browsing cached files.

## 🤝 Contributing
Contributions are welcome! Feel free to fork this repo and submit a pull request.

## 📬 Contact
GitHub: [https://github.com/Avinash-Jha-ai](https://github.com/Avinash-Jha-ai)  
LinkedIn: [Avinash Jha](https://www.linkedin.com/in/avinash-jha-0a261b385/)

⭐ **If you like this project, don’t forget to give it a star!**
