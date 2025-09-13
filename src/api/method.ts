import axios, { AxiosResponse, AxiosError } from "axios";
import { BASE_URL } from "./urls";
import { getToken, deleteData } from "../utils/localstorage";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// A type for the user data stored in localStorage
interface UserData {
  token: string;
  // add other user properties here if available
}

export const getRequest = async (url: string): Promise<any> => {
  let token = getToken();
  try {
    if (token) {
      const userData: UserData = JSON.parse(token);
      const response: AxiosResponse = await axiosInstance.get(url, {
        headers: { Authorization: `Bearer ${userData?.token}` },
      });
      return response;
    } else {
      const response: AxiosResponse = await axiosInstance.get(url);
      return response.data;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const postRequest = async (url: string, data: any, fileAvailable?: boolean): Promise<any> => {
  let token = getToken();
  let response: AxiosResponse;
  try {
    let headers: any = {};
    if (token) {
      const userData: UserData = JSON.parse(token);
      headers['Authorization'] = `Bearer ${userData?.token}`;
    }

    if (fileAvailable) {
      headers['Content-Type'] = 'multipart/form-data';
    }

    response = await axiosInstance.post(url, data, { headers });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      if (axiosError.response.status === 401) {
        // Handle unauthorized access
      }
      return axiosError.response.data;
    } else if (axiosError.request) {
      console.error("Error in request: No response received");
    } else {
      console.error("Error in request setup:", axiosError.message);
    }
    return error;
  }
};

export const patchRequest = async (url: string, data: any): Promise<any> => {
  try {
    const token = getToken();
    if (!token) throw new Error("No token found");
    const userData: UserData = JSON.parse(token);
    const response: AxiosResponse = await axiosInstance.patch(url, data, {
      headers: { Authorization: `Bearer ${userData?.token}` },
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      if (axiosError.response.status === 401) {
        deleteData();
        window.location.href = "/login";
      }
      return axiosError.response.data;
    } else {
        console.error("Request Error:", axiosError.message);
    }
    return error;
  }
};

export const putRequest = async (url: string, data: any): Promise<any> => {
    let token = getToken();
    if (!token) throw new Error("No token found");
    try {
        const userData: UserData = JSON.parse(token);
        const response: AxiosResponse = await axiosInstance.put(url, data, {
            headers: { Authorization: `Bearer ${userData?.token}` },
        });
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
            if (axiosError.response.status === 401) {
                deleteData();
                window.location.href = "/login";
            }
            return axiosError.response.data;
        } else {
            console.error("Request Error:", axiosError.message);
        }
        return error;
    }
};

export const deleteRequest = async (url: string): Promise<any> => {
    try {
        const token = getToken();
        if (!token) throw new Error("No token found");
        const userData: UserData = JSON.parse(token);
        const response: AxiosResponse = await axiosInstance.delete(url, {
            headers: { Authorization: `Bearer ${userData?.token}` },
        });
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
            if (axiosError.response.status === 401) {
                deleteData();
                window.location.href = "/login";
            }
            return axiosError.response.data;
        } else {
            console.error("Request Error:", axiosError.message);
        }
        return error;
    }
};