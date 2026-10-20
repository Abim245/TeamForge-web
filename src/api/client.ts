import axios from "axios";

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function errorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data?.errors) {
      const first = Object.values(data.errors).flat()[0];
      if (typeof first === "string") return first;
    }
    return data?.message ?? "Could not reach the server";
  }
  return "Something went wrong";
}

export function errorData(err: unknown) {
  return axios.isAxiosError(err) ? err.response?.data : undefined;
}