export const ROLES = {
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
  SUPPORT_AGENT: 'SUPPORT_AGENT',
  MEMBER: 'MEMBER',
};

export const ROLE_COLORS = {
  PLATFORM_ADMIN: 'bg-danger/10 text-danger border-danger/20',
  SUPPORT_AGENT: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  MEMBER: 'bg-sand text-slate border-sand-dark/20',
};

export function normalizeRoles(user) {
  if (!user) return [];
  return user.roles || (user.role ? [user.role] : []);
}

export function hasRole(user, role) {
  return normalizeRoles(user).includes(role);
}

export function isAdmin(user) {
  return hasRole(user, ROLES.PLATFORM_ADMIN) || hasRole(user, ROLES.SUPPORT_AGENT);
}

export function isPlatformAdmin(user) {
  return hasRole(user, ROLES.PLATFORM_ADMIN);
}

export function isSupportAgent(user) {
  return hasRole(user, ROLES.SUPPORT_AGENT);
}

export function isRegularUser(user) {
  return !isAdmin(user);
}

export const RESTRICTED_ADMIN_ROUTES = [
  '/admin/audit',
  '/admin/webhooks',
  '/admin/legal',
  '/admin/deletion-requests',
  '/admin/deletions',
];

export function canAccessRoute(user, pathname) {
  if (!isAdmin(user)) return false;
  if (isPlatformAdmin(user)) return true;
  return !RESTRICTED_ADMIN_ROUTES.some((route) => pathname.startsWith(route));
}
