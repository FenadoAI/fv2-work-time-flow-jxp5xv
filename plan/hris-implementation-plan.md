# HRIS Leave Management System - Implementation Plan

## Overview
Building a comprehensive HRIS leave management system with role-based access control.

## Phase 1: Design System
- Check for existing design-system.md or create one

## Phase 2: Backend APIs
### 2.1 Authentication & User Management
- POST /api/auth/register - Register new user
- POST /api/auth/login - User login with role assignment
- GET /api/users - List all users (Admin only)
- PUT /api/users/{user_id}/role - Update user role (Admin only)
- PUT /api/users/{user_id}/leave-balance - Set leave balance (Admin only)

### 2.2 Leave Management
- POST /api/leaves/apply - Submit leave request
- GET /api/leaves/my-requests - Get employee's leave requests
- GET /api/leaves/pending - Get pending approvals (Manager/Admin)
- PUT /api/leaves/{leave_id}/approve - Approve leave request
- PUT /api/leaves/{leave_id}/reject - Reject leave request
- GET /api/leaves/balance - Get current leave balance
- GET /api/leaves/calendar - Get leave calendar data
- GET /api/leaves/report - Export leave report (Admin)

### 2.3 Leave Policy Configuration
- GET /api/config/leave-types - Get configured leave types
- PUT /api/config/leave-types - Update leave types (Admin only)

## Phase 3: Frontend Development
### 3.1 Authentication Pages
- Login page with role selection
- Registration page

### 3.2 Employee Dashboard
- Leave balance display
- Leave request form
- Request history table
- Leave calendar view

### 3.3 Manager Dashboard
- Pending approvals list
- Approve/reject interface
- Team leave calendar

### 3.4 Admin Dashboard
- User management (add/edit/delete users, assign roles)
- Leave balance configuration
- Leave policy settings
- Export reports functionality

## Phase 4: Integration
- Connect frontend to backend APIs
- Implement notification system (email/WhatsApp placeholder)
- Test complete workflow

## Database Schema
### Collections:
1. **users**
   - _id, username, email, password_hash, role (employee/manager/admin)
   - leave_balances: {cl, el, sl, wfh, compensatory}
   - manager_id (for employees)

2. **leave_requests**
   - _id, employee_id, leave_type, start_date, end_date, days_count
   - reason, status (pending/approved/rejected)
   - applied_date, reviewed_by, reviewed_date
   - comments

3. **leave_config**
   - _id, leave_types configuration
   - policy_rules

## Leave Types
- CL (Casual Leave)
- EL (Earned Leave)
- SL (Sick Leave)
- WFH (Work From Home)
- Compensatory Leave

## Success Criteria
- Complete leave workflow from application to approval
- Automatic balance deduction on approval
- Role-based access control working
- All dashboards functional
- Reports exportable
