# User Roles & Permissions

## Overview

TBDC Horizon implements a comprehensive role-based access control (RBAC) system that defines user permissions and data access based on their assigned roles. The system ensures data security while providing appropriate functionality for different user types.

## Role Hierarchy

### 1. **Admin Role**
**Highest level of access and control**

#### Permissions
- **Full System Access**: View and manage all data across all companies
- **User Management**: Create, edit, delete, and manage all users
- **Role Assignment**: Assign and change user roles
- **System Administration**: Access to administrative features
- **Data Oversight**: View all sessions, meetings, connections, and reports
- **Company Management**: Manage multiple companies and their data

#### Accessible Features
- All user features
- Admin portal
- User creation and management
- Role assignment
- System-wide data access
- Company management
- Advanced reporting

#### Data Access
- **Users**: All users across all companies
- **Sessions**: All sessions across all cohorts
- **Meetings**: All meetings across all companies
- **Connections**: All connections across all companies
- **Notes**: All notes across all companies
- **Reports**: All reports across all companies

#### UI Elements
- Admin portal access in profile
- User management interface
- Role assignment controls
- System-wide filtering options
- Administrative dashboards

### 2. **User Role**
**Standard user with company-specific access**

#### Permissions
- **Company Data Access**: View and manage data within their company
- **Personal Profile**: Manage own profile information
- **Session Access**: View sessions for their cohort
- **Meeting Management**: Create and manage company meetings
- **Connection Management**: Manage company connections
- **Notes Management**: Create and manage connection notes
- **Reports Access**: View company reports

#### Accessible Features
- Home dashboard
- Sessions (cohort-filtered)
- Meetings (company-filtered)
- Connections (company-filtered)
- Notes (company-filtered)
- Reports (company-filtered)
- Profile management

#### Data Access
- **Users**: Only own profile
- **Sessions**: Sessions for their cohort only
- **Meetings**: Meetings for their company only
- **Connections**: Connections for their company only
- **Notes**: Notes for their company only
- **Reports**: Reports for their company only

#### UI Elements
- Standard user interface
- Company-specific data views
- Cohort-filtered sessions
- Personal profile management

## Permission Matrix

| Feature | Admin | User |
|---------|-------|------|
| **Authentication** |
| Login | ✓ | ✓ |
| Signup | ✓ | ✓ |
| Password Reset | ✓ | ✓ |
| **User Management** |
| View All Users | ✓ | ✗ |
| Create Users | ✓ | ✗ |
| Edit Users | ✓ | ✗ |
| Delete Users | ✓ | ✗ |
| Assign Roles | ✓ | ✗ |
| **Sessions** |
| View All Sessions | ✓ | ✗ |
| View Cohort Sessions | ✓ | ✓ |
| Create Sessions | ✓ | ✗ |
| Edit Sessions | ✓ | ✗ |
| Delete Sessions | ✓ | ✗ |
| **Meetings** |
| View All Meetings | ✓ | ✗ |
| View Company Meetings | ✓ | ✓ |
| Create Meetings | ✓ | ✓ |
| Edit Meetings | ✓ | ✓ |
| Delete Meetings | ✓ | ✓ |
| **Connections** |
| View All Connections | ✓ | ✗ |
| View Company Connections | ✓ | ✓ |
| Create Connections | ✓ | ✓ |
| Edit Connections | ✓ | ✓ |
| Delete Connections | ✓ | ✓ |
| **Notes** |
| View All Notes | ✓ | ✗ |
| View Company Notes | ✓ | ✓ |
| Create Notes | ✓ | ✓ |
| Edit Notes | ✓ | ✓ |
| Delete Notes | ✓ | ✓ |
| **Reports** |
| View All Reports | ✓ | ✗ |
| View Company Reports | ✓ | ✓ |
| Upload Reports | ✓ | ✓ |
| Download Reports | ✓ | ✓ |
| **Admin Features** |
| Admin Portal | ✓ | ✗ |
| User Management | ✓ | ✗ |
| System Settings | ✓ | ✗ |
| Analytics | ✓ | ✗ |

## Data Isolation Rules

### Company-Based Isolation
- Users can only access data associated with their `company_uid`
- Data is automatically filtered based on user's company
- Cross-company data access is prevented at the database level

### Cohort-Based Isolation
- Sessions are filtered by user's cohort
- Users only see sessions relevant to their cohort
- Cohort information is stored in user profile

### Row-Level Security (RLS)
```sql
-- Company-based access for sessions
CREATE POLICY "Company access for sessions" ON sessions
  FOR ALL USING (company_uid = (SELECT company_uid FROM users WHERE id = auth.uid()::uuid));

-- Cohort-based access for sessions
CREATE POLICY "Cohort access for sessions" ON sessions
  FOR ALL USING (cohort = (SELECT cohort FROM users WHERE id = auth.uid()::uuid));

-- Admin override for all data
CREATE POLICY "Admin access" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::uuid AND role = 'Admin'
    )
  );
```

## Role Assignment

### Initial Role Assignment
- New users are assigned "User" role by default
- Only Admins can change user roles
- Role changes require admin privileges

### Role Change Process
1. Admin accesses user management
2. Selects user to modify
3. Changes role from User to Admin or vice versa
4. System updates user permissions immediately
5. User receives updated access on next login

### Role Validation
```typescript
// Role validation in TypeScript
type UserRole = 'Admin' | 'User';

interface User {
  id: string;
  role: UserRole;
  companyUID: string;
  cohort?: string;
}

// Role checking function
function hasAdminAccess(user: User): boolean {
  return user.role === 'Admin';
}

function hasCompanyAccess(user: User, companyUID: string): boolean {
  return user.role === 'Admin' || user.companyUID === companyUID;
}
```

## Security Implementation

### Authentication Security
- JWT-based authentication
- Secure password storage (hashed)
- Session timeout management
- Multi-factor authentication ready

### Authorization Checks
```typescript
// Authorization middleware
const checkPermission = (requiredRole: UserRole, user: User) => {
  if (user.role === 'Admin') return true;
  return user.role === requiredRole;
};

// Company access check
const checkCompanyAccess = (user: User, companyUID: string) => {
  if (user.role === 'Admin') return true;
  return user.companyUID === companyUID;
};
```

### Data Access Control
- Database-level row security
- API-level permission checks
- UI-level feature hiding
- Client-side validation

## UI Implementation

### Role-Based UI Elements

#### Admin-Only Elements
```typescript
// Admin portal access
{user.role === 'Admin' && (
  <TouchableOpacity onPress={() => setAdminModalVisible(true)}>
    <Shield size={20} color="#1976d2" />
    <Text>Admin Portal</Text>
  </TouchableOpacity>
)}

// User management interface
{user.role === 'Admin' && (
  <FlatList
    data={users}
    renderItem={({ item }) => (
      <UserCard user={item} onPress={() => handleUserSelect(item)} />
    )}
  />
)}
```

#### Conditional Features
```typescript
// Role-based filtering options
const getFilterOptions = (user: User) => {
  if (user.role === 'Admin') {
    return {
      showAllCompanies: true,
      showAllCohorts: true,
      showUserManagement: true,
    };
  }
  return {
    showAllCompanies: false,
    showAllCohorts: false,
    showUserManagement: false,
  };
};
```

## Error Handling

### Permission Denied Errors
```typescript
// Permission error handling
const handlePermissionError = (error: Error) => {
  if (error.message.includes('permission denied')) {
    Alert.alert(
      'Access Denied',
      'You do not have permission to perform this action.'
    );
  }
};
```

### Graceful Degradation
- Hide unauthorized features
- Show appropriate error messages
- Redirect to accessible areas
- Maintain app stability

## Audit Trail

### Role Change Logging
```typescript
// Role change tracking
const logRoleChange = async (
  adminUser: User,
  targetUser: User,
  newRole: UserRole
) => {
  await supabase.from('audit_logs').insert({
    action: 'role_change',
    admin_id: adminUser.id,
    target_user_id: targetUser.id,
    old_role: targetUser.role,
    new_role: newRole,
    timestamp: new Date().toISOString(),
  });
};
```

### Access Logging
- Track user login/logout
- Log data access attempts
- Monitor permission violations
- Generate security reports

## Future Enhancements

### Advanced Roles
- **Mentor Role**: Session-specific permissions
- **Organizer Role**: Event management permissions
- **Viewer Role**: Read-only access
- **Custom Roles**: Configurable permissions

### Permission Groups
- **Data Access Groups**: Fine-grained data permissions
- **Feature Groups**: Module-specific access
- **Time-based Permissions**: Temporary access grants
- **Geographic Permissions**: Location-based access

### Enhanced Security
- **Multi-factor Authentication**: Additional security layer
- **IP-based Restrictions**: Geographic access control
- **Session Management**: Advanced session controls
- **Audit Logging**: Comprehensive activity tracking 