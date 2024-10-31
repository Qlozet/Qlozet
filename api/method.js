import axios from "axios";
import { useRouter } from 'next/router';
import { BASE_URL } from "./urls";
// import { toastError } from "../utils/toast";
import { getToken } from "../utils/localstorage";
const axiosInstance = axios.create({
  baseURL: BASE_URL,
});
import { redirect } from "next/navigation";
export const getRequest = async (url) => {
  const router = useRouter();
  let userData;
  let token = getToken();
  let response;
  try {
    if (token) {
      userData = JSON.parse(token);
      response = await axiosInstance.get(url, {
        headers: { Authorization: `Bearer ${userData?.token}` },
      });

      return response;
    } else {
      response = await axiosInstance.get(url);
      return response.data;
    }
  } catch (error) {
    console.log(error)
    if (error.response?.data === "Unauthorized") {
      return "Unauthorized"
    } else {
      return error.response;
    }
  }
};

export const postRequest = async (url, data, fileAvailable) => {
  let userData;
  let token = getToken();
  let response;
  try {
    if (token) {
      userData = JSON.parse(token);
      response = fileAvailable
        ? await axiosInstance.post(url, data, {
          headers: {
            Authorization: `Bearer ${userData?.token}`,
            "Content-Type": "multipart/form-data",
          },
        })
        : await axiosInstance.post(url, data, {
          headers: {
            Authorization: `Bearer ${userData?.token}`,
          },
        });
    } else {
      response = fileAvailable
        ? await axiosInstance.post(url, data, {
          headers: {
            Authorization: `Bearer ${userData?.token}`,
            "Content-Type": "multipart/form-data",
          },
        })
        : await axiosInstance.post(url, data, {
          headers: {
            Authorization: `Bearer ${userData?.token}`,
          },
        });
    }
    return response.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return error.response.data;
      // alert(error.response.data.data ?? error);

      if (error.response.status === 401) {
        // toastError("Unauthotized! Re-login to continue");
        return;
      }
      if (error.response.data) {
        return error.response.data;
      }
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      // toastError("Error in request");
    } else {
      // Something happened in setting up the request that triggered an Error
      // toastError("Error in request");
    }
  }
};

export const patchRequest = async (url, data) => {
  try {
    const userData = JSON.parse(getToken());
    let response;
    if (userData !== null) {
      response = await axiosInstance.patch(url, data, {
        headers: { Authorization: `Bearer ${userData?.token}` },
      });
    } else {
      response = await axiosInstance.post(url, data);
    }
    return response.data;
  } catch (error) {
    // alert(error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        // toastError("Error in request");
        deleteData();
        window.location.href = "/login";
        return;
      }
      if (error.response.data) {
        return error.response.data;
      }
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      // toastError("Error in request");
    } else {
      // Something happened in setting up the request that triggered an Error
      // toastError("Error in request");
    }
  }
};

export const putRequest = async (url, data) => {
  let userData;
  let token = getToken();
  let response;
  try {
    userData = JSON.parse(token);
    response = await axiosInstance.put(url, data, {
      headers: { Authorization: `Bearer ${userData?.token}` },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        toastError("Unauthotized! Re-login to continue");
        deleteData();
        window.location.href = "/login";
        return;
      }
      if (error.response.data) {
        return error.response.data;
      }
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      toastError("Error in request");
    } else {
      // Something happened in setting up the request that triggered an Error
      toastError("Error in request");
    }
  }
};

export const deleteRequest = async (url, data) => {
  try {
    const userData = JSON.parse(getToken());
    let response;
    if (userData !== null) {
      response = await axiosInstance.delete(url, {
        headers: { Authorization: `Bearer ${userData?.token}` },
      });
    } else {
      response = await axiosInstance.post(url, data);
    }
    return response.data;
  } catch (error) {
    // alert(error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        toastError("Unauthotized! Re-login to continue");
        deleteData();
        window.location.href = "/login";
        return;
      }
      if (error.response.data) {
        return error.response.data;
      }
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      toastError("Error in request");
    } else {
      // Something happened in setting up the request that triggered an Error
      toastError("Error in request");
    }
  }
};
