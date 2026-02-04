import api from "./axios";

const AUTH_ENDPOINTS = {
  TOKEN: "/api/token/",
  REFRESH: "/api/token/refresh/",
  REGISTER: "/api/users/register/",
  LOGIN: "/api/users/login/",
  LOGOUT: "/api/users/logout/",
  PROFILE: "/api/users/profile/",
};

// Manage tokens in localStorage
const tokenManager = {
  getAccessToken: () => localStorage.getItem("access_token"),
  getRefreshToken: () => localStorage.getItem("refresh_token"),
  getUser: () => JSON.parse(localStorage.getItem("user") || "null"),
  
  setTokens: (access, refresh, user) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("user", JSON.stringify(user));
  },
  
  clearTokens: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  },
  
  isAuthenticated: () => !!localStorage.getItem("access_token"),
};

// Add interceptor to include token in requests
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (!refreshToken) {
          tokenManager.clearTokens();
          window.location.href = "/login";
          return Promise.reject(error);
        }
        
        const response = await api.post(AUTH_ENDPOINTS.REFRESH, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        const user = tokenManager.getUser();
        
        tokenManager.setTokens(access, refreshToken, user);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        tokenManager.clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

const authService = {
  // User Registration
  register: async (userData) => {
    try {
      const requestBody = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        roll_number: userData.rollNumber,
        full_name: userData.fullName,
        department: userData.department,
      };
      
      console.log("📤 [REGISTER] Request Body:", requestBody);
      
      const response = await api.post(AUTH_ENDPOINTS.REGISTER, requestBody);
      
      console.log("📥 [REGISTER] Response:", response.data);
      
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      console.error("❌ [REGISTER] Error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      
      const errorMsg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.roll_number?.[0] ||
        error.response?.data?.email?.[0] ||
        error.response?.data?.username?.[0] ||
        "Registration failed";
      throw new Error(errorMsg);
    }
  },

  // User Login
  login: async (username, password) => {
    try {
      const requestBody = { username, password };
      
      console.log("📤 [LOGIN] Request Body:", requestBody);
      
      const response = await api.post(AUTH_ENDPOINTS.TOKEN, requestBody);
      
      console.log("📥 [LOGIN] Response:", response.data);
      
      const { access, refresh, user } = response.data;
      
      // Store tokens and user info
      tokenManager.setTokens(access, refresh, user);
      
      console.log("✅ [LOGIN] Tokens stored. User:", user);
      
      return {
        success: true,
        user,
        token: access,
      };
    } catch (error) {
      console.error("❌ [LOGIN] Error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      
      const errorMsg =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Login failed";
      throw new Error(errorMsg);
    }
  },

  // User Logout
  logout: async () => {
    try {
      console.log("📤 [LOGOUT] Request");
      
      await api.post(AUTH_ENDPOINTS.LOGOUT);
      
      console.log("📥 [LOGOUT] Success");
    } catch (error) {
      console.error("❌ [LOGOUT] Error:", error);
    } finally {
      console.log("🗑️ [LOGOUT] Clearing tokens");
      tokenManager.clearTokens();
    }
  },

  // Get current user
  getCurrentUser: () => {
    return tokenManager.getUser();
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return tokenManager.isAuthenticated();
  },

  // Check user role (RBAC)
  hasRole: (role) => {
    const user = tokenManager.getUser();
    return user?.role === role;
  },

  // Check if user has any of the given roles
  hasAnyRole: (roles) => {
    const user = tokenManager.getUser();
    return roles.includes(user?.role);
  },

  // Check if user is a student
  isStudent: () => {
    return authService.hasRole("student");
  },

  // Check if user is an administrator
  isAdministrator: () => {
    return authService.hasRole("administrator");
  },

  // Get access token
  getAccessToken: () => {
    return tokenManager.getAccessToken();
  },

  // Get refresh token
  getRefreshToken: () => {
    return tokenManager.getRefreshToken();
  },

  // Refresh token manually
  refreshToken: async () => {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      console.log("📤 [REFRESH_TOKEN] Request");

      const response = await api.post(AUTH_ENDPOINTS.REFRESH, {
        refresh: refreshToken,
      });

      console.log("📥 [REFRESH_TOKEN] Response:", response.data);

      const { access } = response.data;
      const user = tokenManager.getUser();

      tokenManager.setTokens(access, refreshToken, user);

      console.log("✅ [REFRESH_TOKEN] Success");

      return {
        success: true,
        token: access,
      };
    } catch (error) {
      console.error("❌ [REFRESH_TOKEN] Error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      
      tokenManager.clearTokens();
      throw error;
    }
  },
};

export default authService;
