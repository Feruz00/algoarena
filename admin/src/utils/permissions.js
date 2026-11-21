export const hasPermission = (permissions, permission) => {
  if (!permission) return true;

  return permissions.includes(permission);
};
