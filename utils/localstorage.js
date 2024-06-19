const token = "token";
const userDetails = "AltireuserDetails";
const productId = "productId";
const customer = "customer";

export const setToken = (data) => {
  localStorage.setItem(token, data);
};

export const getToken = () => {
  const data = localStorage.getItem(token);
  return data;
};

export const clearToken = (data) => {
  localStorage.removeItem(token);
  return true;
};

export const setUserData = (data) => {
  localStorage.setItem(userDetails, JSON.stringify(data));
};

export const getGetUserDetails = () => {
  const data = localStorage.getItem(userDetails);
  return JSON.parse(data);
};

export const clearUserDetails = (data) => {
  localStorage.removeItem(userDetails);
  return true;
};

export const setProductId = (data) => {
  localStorage.setItem(productId, JSON.stringify(data));
};

export const getProductId = () => {
  const data = localStorage.getItem(productId);
  return JSON.parse(data);
};

export const clearProductId = (data) => {
  localStorage.removeItem(productId);
  return true;
};

export const setCustomerId = (data) => {
  localStorage.setItem(customer, JSON.stringify(data));
};

export const getCustomerId = () => {
  const data = localStorage.getItem(customer);
  return JSON.parse(data);
};

export const clearCustomerId = (data) => {
  localStorage.removeItem(customer);
  return true;
};
