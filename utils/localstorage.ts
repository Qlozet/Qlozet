const TOKEN_KEY = "token";
const USER_DETAILS_KEY = "AltireuserDetails";
const PRODUCT_ID_KEY = "productId";
const CUSTOMER_KEY = "customer";

// Type safety for user data
interface UserDetails {
  // Define the structure of your user object
  id: string;
  name: string;
  email: string;
}

export const setToken = (data: string): void => {
  localStorage.setItem(TOKEN_KEY, data);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const clearToken = (): boolean => {
  localStorage.removeItem(TOKEN_KEY);
  return true;
};

export const setUserData = (data: UserDetails): void => {
  localStorage.setItem(USER_DETAILS_KEY, JSON.stringify(data));
};

export const getGetUserDetails = (): UserDetails | null => {
  const data = localStorage.getItem(USER_DETAILS_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearUserDetails = (): boolean => {
  localStorage.removeItem(USER_DETAILS_KEY);
  return true;
};

export const setProductId = (data: string): void => {
  localStorage.setItem(PRODUCT_ID_KEY, JSON.stringify(data));
};

export const getProductId = (): string | null => {
  const data = localStorage.getItem(PRODUCT_ID_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearProductId = (): boolean => {
  localStorage.removeItem(PRODUCT_ID_KEY);
  return true;
};

interface LocalStorageHandlers {
  getCustomerId: () => string | null;
  setCustomerId: (id: string) => void;
}

export const getCustomerId = (): string | null => {
  const data = localStorage.getItem(CUSTOMER_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearCustomerId = (): boolean => {
  localStorage.removeItem(CUSTOMER_KEY);
  return true;
};

// A general function to clear all relevant user data on logout
export const deleteData = (): void => {
    clearToken();
    clearUserDetails();
    clearProductId();
    clearCustomerId();
}