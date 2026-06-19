# YarnBazaar Fixes & Enhancements

This plan outlines the steps to resolve the GST lookup issue on the hosted environment, implement a secure password reset flow for sellers and buyers, and provide a protected profile update mechanism for the admin.

## User Review Required

> [!WARNING]
> **Database Schema Changes**
> I will be adding `resetToken` and `resetTokenExpiry` fields to both the `Buyer` and `Seller` models in your `schema.prisma`. Because you are using PostgreSQL on Render, this will require running a Prisma migration.

> [!IMPORTANT]
> **Admin Special Key**
> The `ADMIN_SPECIAL_KEY` environment variable will be set to `YarnBazaar$@m1924`. You will need to add this to your Render Environment Variables for the admin profile update feature to work in production.

## Proposed Changes

---

### Global API URL Fix (GST Lookup & other endpoints)

Currently, the frontend hardcodes `const API = 'http://localhost:5000/api';`. This causes requests on the live site to fail because your browser tries to connect to your local computer instead of the live server.

#### [MODIFY] `frontend/seller/register.html` & All Frontend Files
- Replace the hardcoded `http://localhost:5000/api` with a dynamic variable that uses `/api` in production so it targets the live server automatically.

---

### Database Schema Updates

#### [MODIFY] `backend/prisma/schema.prisma`
- Add `resetToken String?` to `Seller` and `Buyer`
- Add `resetTokenExpiry DateTime?` to `Seller` and `Buyer`

---

### Backend API Enhancements

#### [MODIFY] `backend/src/controllers/authController.js` & `backend/src/routes/auth.js`
- **Forgot Password (`POST /api/auth/forgot-password`)**: Takes email, verifies it exists, generates a token, saves it to the DB, and sends an email via `emailService.js`.
- **Reset Password (`POST /api/auth/reset-password`)**: Takes token and new password, verifies token validity and expiry, hashes new password, and updates the DB.
- **Change Password (`PUT /api/auth/change-password`)**: For logged-in users (from Profile section) to change their password directly by verifying their old password.

#### [MODIFY] `backend/src/controllers/adminController.js` & `backend/src/routes/admin.js`
- **Update Admin Profile (`PUT /api/admin/profile`)**: Takes new `name`, `password`, and `specialKey`. Validates the `specialKey` against `process.env.ADMIN_SPECIAL_KEY` (`YarnBazaar$@m1924`). If valid, updates the admin record.

---

### Frontend Enhancements

#### [NEW] `frontend/shared/forgot-password.html` & `reset-password.html`
- Separate HTML pages to request a reset link (by entering email) and enter the new password.

#### [MODIFY] `frontend/buyer/login.html` & `frontend/seller/login.html`
- If the user enters an incorrect password, display a "Forgot Password?" button linking to the forgot password page.

#### [MODIFY] `frontend/buyer/dashboard.html` & `frontend/seller/dashboard.html`
- In the Profile section, add an option to "Change Password" directly.

#### [MODIFY] `frontend/yb-sys-manage-992/dashboard.html`
- Add an "Admin Profile" section (or modal) where the admin can input their current Special Key, new Name, and new Password to update their credentials.

## Verification Plan

### Automated / Backend Tests
- Update database schema and run `npx prisma db push`.
- Test `forgot-password` endpoint to verify emails are logged/sent.
- Test `reset-password` endpoint to verify the password is changed and old password fails.
- Test `admin/profile` endpoint with and without the correct `ADMIN_SPECIAL_KEY`.

### Manual Verification
- Verify GST Lookup succeeds on Render once the API URL is fixed.
- Attempt a password reset flow through the frontend UI.
- Update the admin name and password via the admin dashboard UI.
