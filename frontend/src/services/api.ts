import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 (but not during login itself)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config.url.includes("/auth/login")
    ) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth
export const registerUser = (data: { name: string; email: string; password: string }) =>
  API.post("/auth/register", data);

export const loginPolice = async (credentials: { email: string; password: string }) => {
  const res = await API.post("/auth/login", credentials);
  if (!res.data.success) throw new Error(res.data.message || "Login failed");
  return {
    data: {
      token: res.data.token,
      user: {
        id: res.data.user._id ?? res.data.user.id,
        name: res.data.user.name,
        email: res.data.user.email,
        role: res.data.user.role,
      },
    },
  };
};

export const loginUser = async (credentials: { email: string; password: string }) => {
  const res = await API.post("/auth/login", credentials);
  if (!res.data.success) throw new Error(res.data.message || "Login failed");
  return {
    data: {
      token: res.data.token,
      user: {
        id: res.data.user._id ?? res.data.user.id,
        name: res.data.user.name,
        email: res.data.user.email,
        role: res.data.user.role,
      },
    },
  };
};

// SOS
export const fetchSOSAlerts = () => API.get("/sos");
export const fetchSOSById = (id: string) => API.get(`/sos/${id}`);
export const updateSOSStatus = (id: string, status: string) =>
  API.put(`/sos/${id}/status`, { status });
export const fetchNearbySOS = (lat: number, lng: number, radius: number) =>
  API.get(`/sos/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
export const createSOS = (data: { latitude: number; longitude: number }) =>
  API.post("/sos", data);
export const fetchMySOS = () => API.get("/sos/my");
export const uploadSOSAudio = (dispatchId: string, audioBlob: Blob) => {
  const formData = new FormData();
  formData.append("audio", audioBlob, "sos-audio.webm");
  return API.post(`/sos/${dispatchId}/upload-audio`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export default API;
