
// Utility para verificar se uma rota precisa de proteção admin
export const isAdminRoute = (pathname: string): boolean => {
  return pathname.startsWith('/admin');
};

export const shouldRedirectFromAdmin = (pathname: string, isAdmin: boolean): boolean => {
  return isAdminRoute(pathname) && !isAdmin;
};
