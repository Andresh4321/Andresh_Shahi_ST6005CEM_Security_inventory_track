export const setAuthToken = async (token: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_token", token);
};

export const getAuthToken = async () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};

export const setUserData = async (userData: any) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("inventorytrack_user", JSON.stringify(userData));
};

export const getUserData = async () => {
  if (typeof window === "undefined") return null;

  const userDataStr = localStorage.getItem("inventorytrack_user");
  if (!userDataStr) return null;

  try {
    return JSON.parse(userDataStr);
  } catch {
    return null;
  }
};

export const clearAuthCookies = async () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
  localStorage.removeItem("inventorytrack_user");
};
