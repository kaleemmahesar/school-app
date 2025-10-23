# Role-Based Access Control (RBAC) Implementation

This document explains the role-based access control system implemented in the School Management System.

## Overview

The RBAC system controls access to application features based on user roles. It provides three distinct roles with different levels of access:

1. **Owner** - Complete system access
2. **Administrator** - Full access except financial information
3. **Teacher** - Limited view-only access to student-related features

## Implementation Details

### 1. User Roles and Permissions

Roles and their permissions are defined in `src/store/usersSlice.js`:

```javascript
const rolesConfig = {
  owner: {
    name: 'Owner',
    permissions: ['all'] // Complete access
  },
  admin: {
    name: 'Administrator',
    permissions: [
      'students', 'attendance', 'marksheets', 'classes', 
      'staff', 'reports', 'settings', 'users'
      // Excludes financial info (fees, expenses)
    ]
  },
  teacher: {
    name: 'Teacher',
    permissions: [
      'students-view', 'attendance', 'marksheets-view'
      // View-only access to students, attendance, and marksheets
    ]
  }
};
```

### 2. Permission Checking Hooks

The `usePermissions` hook in `src/hooks/usePermissions.js` provides functions to check user permissions:

```javascript
import { usePermissions } from '../hooks/usePermissions';

const MyComponent = () => {
  const { hasPermission, isOwner, isAdmin, isTeacher } = usePermissions();
  
  // Check if current user has specific permission
  if (hasPermission('fees')) {
    // Show financial information
  }
  
  // Check user role
  if (isOwner()) {
    // Show owner-only features
  }
};
```

### 3. Protected Routes

The `ProtectedRoute` component in `src/components/common/ProtectedRoute.jsx` restricts access to routes based on permissions:

```javascript
// Protect a route that requires financial access
<Route 
  path="/fees" 
  element={
    <ProtectedRoute permission={['fees', 'owner']} redirectPath="/unauthorized">
      <FeesSection />
    </ProtectedRoute>
  } 
/>
```

### 4. Component-Level Permission Checking

The `PermissionChecker` component in `src/components/common/PermissionChecker.jsx` allows conditional rendering within components:

```javascript
<PermissionChecker permission="fees">
  <FinancialDashboard />
</PermissionChecker>

<PermissionChecker permission="fees" fallback={<AccessDeniedMessage />}>
  <ExpenseManagement />
</PermissionChecker>
```

## Role-Specific Access

### Owner Access
- Full access to all application features
- Can view and manage financial information (fees, expenses)
- Complete administrative privileges
- Access to user management

### Administrator Access
- Access to all features except financial information
- Cannot view or manage fees and expenses
- Can manage students, classes, staff, and reports
- Access to user management (limited)

### Teacher Access
- Limited access to student-related work
- View-only permissions for students, attendance, and marksheets
- Cannot modify financial or administrative data
- Cannot access user management

## Navigation Filtering

The `Layout` component dynamically filters navigation items based on user permissions:

```javascript
// In Layout.jsx
const filterNavItemsByPermissions = (items) => {
  return items.filter(item => {
    // If no permissions specified, available to all
    if (!item.permissions || item.permissions.length === 0) {
      return true;
    }
    
    // Owner has access to everything
    if (isOwner()) {
      return true;
    }
    
    // Check if user has any of the required permissions
    return hasAnyPermission(item.permissions);
  });
};
```

## Adding New Roles or Permissions

To add new roles or modify existing ones:

1. Update the `rolesConfig` object in `src/store/usersSlice.js`
2. Add new permission checks in the `usePermissions` hook if needed
3. Update navigation filtering logic in `Layout.jsx` if new permission types are added
4. Protect new routes with `ProtectedRoute` component
5. Use `PermissionChecker` for conditional rendering within components

## Security Considerations

1. **Frontend Security**: The RBAC system provides UI-level access control. In a production environment, all API endpoints should also implement server-side authorization.

2. **Permission Granularity**: Permissions are defined at a feature level. For more granular control, permissions can be defined at the action level (e.g., 'students-create', 'students-read', 'students-update', 'students-delete').

3. **Data Protection**: Sensitive data should not be loaded in the Redux store for users without appropriate permissions.

## Testing Role-Based Access

To test the RBAC system:

1. Log in with different user roles using the demo credentials
2. Verify that navigation items are filtered appropriately
3. Confirm that protected routes redirect unauthorized users
4. Check that component-level permission checks work correctly
5. Ensure that users can only access features appropriate to their role

## Future Enhancements

1. **Fine-Grained Permissions**: Implement action-level permissions for more precise access control
2. **Role Hierarchies**: Add support for role inheritance and composite roles
3. **Dynamic Permissions**: Allow administrators to modify role permissions through the UI
4. **Audit Logging**: Track permission-related activities for security monitoring