import axios, { AxiosResponse } from "axios";
import { API_BASE_URL } from "@/data/endpoints";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const makeApiCall = async (
  method: string,
  url: string,
  data?: any,
  isFormData?: boolean
): Promise<AxiosResponse> => {
  const config: any = {
    method,
    url,
    withCredentials: true,
  };

  if (isFormData) {
    config.headers = {
      "Content-Type": "multipart/form-data",
    };
    config.data = data;
  } else if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
    config.data = data;
  }

  return await apiClient(config);
};
