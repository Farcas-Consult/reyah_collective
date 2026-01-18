# Reyah Collective Admin Setup & Access Guide

## How to Create and Access an Admin Account

### 1. Register a New Account
- Go to `/signup` on your deployed site.
- Fill in the registration form (as customer, seller, or supplier).
- Complete the signup process.

### 2. Grant Admin Access
- After registering, visit `/admin-setup`.
- Enter the email address of the account you just created.
- Click **Grant Admin Access**.
- You should see a success message.

### 3. Login as Admin
- Go to `/login`.
- Sign in with your admin email and password.
- You will be redirected to `/admin` and have admin privileges.

## Notes
- There is no separate admin signup page. Any account can be made admin via `/admin-setup`.
- If you redeploy or clear browser storage, repeat the above steps.
- All user data is stored in browser localStorage (per device/browser).
- For persistent, multi-user admin access, consider integrating a real backend/database.

## Troubleshooting
- **Can't login as admin?**
  - Make sure you registered the account and granted admin access in the deployed environment.
  - Check that you used the correct email in `/admin-setup`.
  - If you see 'No users found!' in `/admin-setup`, register the account first at `/signup`.
- **Admin access lost after redeploy?**
  - Repeat the steps above to recreate the admin account.

## Quick Reference
- Signup: `/signup`
- Grant Admin: `/admin-setup`
- Login: `/login`
- Admin Dashboard: `/admin`

---
For further customization or backend integration, contact the development team.
