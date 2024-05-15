const token = "token";
const userDetails = "AltireuserDetails";

export const setToken = (data) => {
  localStorage.setItem(token, data);
};

export const getToken = () => {
  const data = localStorage.getItem(token);
  return data;
};

export const clearToken = (data) => {
  localStorage.clear(token);
  return true;
};

export const setUserDetails = (data) => {
  localStorage.setItem(userDetails, JSON.stringify(data));
};

export const getGetUserDetails = () => {
  const data = localStorage.getItem(userDetails);
  return JSON.parse(data);
};

export const clearUserDetails = (data) => {
  localStorage.clear(userDetails);
  return true;
};
