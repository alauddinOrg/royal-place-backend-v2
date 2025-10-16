# 🏨 Royal Place — Hotel Management Backend API

Welcome to the backend of **Royal Place**, a robust hotel management system built with **Express.js**, **TypeScript**, and **MongoDB**. This API powers essential features such as room booking, user management, payments, and more.

---

## 🚀 Features

- **User Authentication & Role Management**
- **Room Booking System**
- **Stripe Payment Integration**
- **Hotel Amenities & Services**
- **Customer Testimonials**
- **Refund & Cancellation Prediction Endpoint**

---

## 🔐 Environment Variables

Create a `.env` file in the project root with the following keys:

```env
PORT=
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
STRIPE_SECRET_KEY=
SUCCESS_URL=http://localhost:5000/api/sucess
FAIL_URL=http://localhost:5000/api/payment/fail
CANCEL_URL=http://localhost:5000/api/payment/cancel

ML_CANCEL_PREDICT_API=
```

> **Note:** Replace the values with your actual credentials before running the project.

---

## 🛠 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Alauddin-24434/royal-place-backend.git
cd royal-place-backend
```

### 2. Install Dependencies

This project uses [pnpm](https://pnpm.io/) (recommended), but you can use npm if needed.

#### Using pnpm (recommended):

```bash
pnpm install
```

#### Using npm:

1. **Delete the pnpm lockfile first:**
    ```bash
    rm -rf pnpm-lock.yaml
    ```
2. **Then install dependencies:**
    ```bash
    npm install
    ```

> **Warning:** Do **not** mix pnpm and npm in the same project.

---

## 🚀 Running the Project

### Development

```bash
pnpm run dev
# or
npm run dev
```

### Production

```bash
pnpm run build && pnpm start
# or
npm run build && npm start
```

## 🐳 Dockerization

This project includes a `Dockerfile` for easy containerization, making deployment more consistent and portable.

### Build the Docker Image

```bash
docker build -t royal-place-backend .
```

### Run the Docker Container

```bash
docker run -p 5000:5000 --env-file .env royal-place-backend
```

**Note:** Ensure your `.env` file is correctly configured for the container environment, especially the `DATABASE_URL` and other service URLs.


-----

---

## 🤝 Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

---

## 📫 Contact

For questions or support, please contact [alauddin150900@gmail.com].
