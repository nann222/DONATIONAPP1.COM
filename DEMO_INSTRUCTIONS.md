# Donation App Demo Instructions

## Overview
The Donation App is now running with mock authentication since MongoDB is not installed. This allows you to test all the functionality without setting up a database.

## Test Accounts
You can log in with these pre-configured accounts:

### Admin Account
- **Email:** admin@example.com
- **Password:** password123
- **Role:** Admin
- **Access:** Full system access, analytics, user management

### Donor Account
- **Email:** donor@example.com
- **Password:** password123
- **Role:** Donor
- **Access:** Create donations, view donation history, track donations

### Recipient Account
- **Email:** recipient@example.com
- **Password:** password123
- **Role:** Recipient
- **Access:** Create requests, view request history, provide feedback

## How to Test

1. **Access the App:** Open http://localhost:3000 in your browser
2. **Login:** Use any of the test accounts above
3. **Explore Features:**
   - Navigate through different dashboards based on your role
   - Try creating new donations (as donor) or requests (as recipient)
   - Test the responsive design by resizing your browser window
   - Check the navigation and user interface

## Features Available

### For All Users:
- ✅ User authentication (login/logout)
- ✅ Responsive design
- ✅ Role-based navigation
- ✅ Modern Material-UI interface

### For Donors:
- ✅ Donor dashboard
- ✅ Create new donations
- ✅ View donation history
- ✅ Track donation status

### For Recipients:
- ✅ Recipient dashboard
- ✅ Create new requests
- ✅ View request history
- ✅ Provide feedback

### For Admins:
- ✅ Admin dashboard
- ✅ System analytics
- ✅ User management overview

## Registration
You can also register new accounts by clicking "Sign Up" and selecting your role (donor, recipient, or admin).

## Notes
- The app is fully functional with mock data
- All forms and navigation work as intended
- The design is responsive and works on mobile devices
- Real database integration would require MongoDB installation

## Servers Running
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

Both servers are running successfully and communicating properly!