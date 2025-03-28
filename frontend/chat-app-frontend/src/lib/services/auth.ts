// src/lib/services/auth.ts
import axios from "axios";
import { authStore } from "../stores/store";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const authService = {
  async register(username: string, email: string, password: string) {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password,
      });

      const { token, user } = response.data;

      authStore.update((store) => ({
        ...store,
        user,
        token,
      }));

      // Save token and user in localStorage
      localStorage.setItem("chat_token", token);
      localStorage.setItem("chat_user", JSON.stringify(user));

      return user;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },
  async login(email: string, password: string) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data;

      authStore.update((store) => ({
        ...store,
        user,
        token,
      }));

      // Save token and user in localStorage
      localStorage.setItem("chat_token", token);
      localStorage.setItem("chat_user", JSON.stringify(user));

      return user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  logout() {
    authStore.update((store) => ({
      ...store,
      user: null,
      token: null,
    }));

    // Remove token from localStorage
    localStorage.removeItem("chat_token");
  },

  async checkAuth() {
    const token = localStorage.getItem("chat_token");
    const user = JSON.parse(localStorage.getItem("chat_user") || "{}");

    if (token) {
      try {
        // Send a POST request to the /validate endpoint with the token
        const response = await axios.post(
          `${API_URL}/auth/validate`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // If the token is valid, update the authStore with user info and token
        if (response.data.valid) {
          authStore.update((store) => ({
            ...store,
            user: response.data.user,
            token,
          }));
        } else {
          // If token is invalid, remove from localStorage
          localStorage.removeItem("chat_token");
          localStorage.removeItem("chat_user");
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        // If validation fails, remove invalid token and user data
        localStorage.removeItem("chat_token");
        localStorage.removeItem("chat_user");
      }
    }
  },
};
