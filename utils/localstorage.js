const token = "token";

export const setToken = (data) => {
  localStorage.setItem(token, data);
};

export const getToken = () => {
  const data = localStorage.getItem(token);
  return data;
};

export const clearToken = (data) => {
  localStorage.clear(token);
};
