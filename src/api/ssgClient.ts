import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { message } from "antd";

/**
 * Centralized Axios client for SSG/WSG API integration.
 *
 * Base URL and credentials are configured via environment variables.
 * Certificate-based mTLS authentication is handled server-side or
 * via a proxy — the user uploads cert.pem and key.pem files through the UI.
 *
 * TODO: For production, configure a backend proxy that attaches the client
 * certificate and private key for mutual TLS authentication. Browser-based
 * apps cannot directly use client certificates in Axios requests.
 */

const ssgClient = axios.create({
  baseURL: import.meta.env.VITE_SSG_API_BASE_URL || "https://uat-api.ssg-wsg.sg",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
});

// Request interceptor: attach auth headers
ssgClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const clientId = import.meta.env.VITE_SSG_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_SSG_CLIENT_SECRET;

    if (clientId) {
      config.headers.set("clientId", clientId);
    }
    if (clientSecret) {
      config.headers.set("clientSecret", clientSecret);
    }

    // Log outgoing requests in development
    if (import.meta.env.DEV) {
      console.log(`[SSG API] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor: error handling and logging
ssgClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[SSG API] Response ${response.status}`, response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const data = error.response?.data as Record<string, unknown> | undefined;

    let errorMessage = "An unexpected error occurred";

    if (status === 401) {
      errorMessage = "Authentication failed. Please check your API credentials.";
    } else if (status === 403) {
      errorMessage = "Access denied. You do not have permission for this operation.";
    } else if (status === 404) {
      errorMessage = "Resource not found.";
    } else if (status === 422) {
      errorMessage = `Validation error: ${data?.message || "Invalid request data"}`;
    } else if (status === 429) {
      errorMessage = "Rate limit exceeded. Please try again later.";
    } else if (status && status >= 500) {
      errorMessage = "SSG API server error. Please try again later.";
    } else if (error.code === "ECONNABORTED") {
      errorMessage = "Request timed out. Please try again.";
    } else if (!error.response) {
      errorMessage = "Network error. Please check your connection.";
    }

    if (import.meta.env.DEV) {
      console.error(`[SSG API] Error ${status}:`, data || error.message);
    }

    message.error(errorMessage);
    return Promise.reject(error);
  }
);

export default ssgClient;
