const token = "token";

export const setToken = (data) => {
  localStorage.setItem(token, data);
};

export const getToken = (data) => {
  localStorage.getItem(token);
};

export const clearToken = (data) => {
  localStorage.clear(token);
};
