/** Modular RBAC for Hiring OS */

export const PLATFORM_ROLES = ['super_admin'];
export const ORG_ROLES = ['org_admin', 'hr_manager', 'recruiter', 'interviewer'];
export const ALL_STAFF_ROLES = [...PLATFORM_ROLES, ...ORG_ROLES];

export const PERMISSIONS = {
  'org:manage': ['super_admin', 'org_admin'],
  'org:view': ['super_admin', 'org_admin', 'hr_manager', 'recruiter', 'interviewer'],
  'jobs:manage': ['super_admin', 'org_admin', 'hr_manager', 'recruiter'],
  'jobs:view': ['super_admin', 'org_admin', 'hr_manager', 'recruiter', 'interviewer'],
  'pipeline:manage': ['super_admin', 'org_admin', 'hr_manager', 'recruiter'],
  'pipeline:view': ['super_admin', 'org_admin', 'hr_manager', 'recruiter', 'interviewer'],
  'candidates:search': ['super_admin', 'org_admin', 'hr_manager', 'recruiter'],
  'candidates:comment': ['super_admin', 'org_admin', 'hr_manager', 'recruiter', 'interviewer'],
  'interviews:manage': ['super_admin', 'org_admin', 'hr_manager', 'recruiter'],
  'talent_pool:manage': ['super_admin', 'org_admin', 'hr_manager', 'recruiter'],
  'analytics:org': ['super_admin', 'org_admin', 'hr_manager'],
  'analytics:platform': ['super_admin'],
  'automation:manage': ['super_admin', 'org_admin', 'hr_manager'],
  'templates:manage': ['super_admin', 'org_admin', 'hr_manager', 'recruiter'],
  'audit:view': ['super_admin', 'org_admin'],
};

export const resolveEffectiveRole = (user) => {
  if (user.platformRole === 'super_admin' || user.role === 'super_admin') return 'super_admin';
  if (user.orgRole) return user.orgRole;
  if (user.role === 'admin') return 'org_admin';
  if (user.role === 'recruiter') return 'recruiter';
  return user.role;
};

export const hasPermission = (user, permission) => {
  const effective = resolveEffectiveRole(user);
  const allowed = PERMISSIONS[permission];
  return allowed?.includes(effective) ?? false;
};
