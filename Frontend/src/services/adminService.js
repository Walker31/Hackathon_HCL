import api from "./axios";

const adminService = {
  getPendingRegistrations: async (params = {}) => {
    try {
      const response = await api.get("/api/admin/registrations/pending/", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching pending registrations:", error);
      throw error;
    }
  },

  handleRegistrationAction: async (registrationId, action, data = {}) => {
    try {
      const response = await api.post(`/api/admin/registrations/${registrationId}/action/`, {
        action,
        ...data
      });
      return response.data;
    } catch (error) {
      console.error(`Error ${action}ing registration ${registrationId}:`, error);
      throw error;
    }
  },

  getStudentsWithDues: async (params = {}) => {
    try {
      const response = await api.get("/api/admin/students/dues/", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching students with dues:", error);
      throw error;
    }
  },

  getDashboardStats: async () => {
    try {
      const response = await api.get("/api/admin/dashboard/stats/");
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }
};

export default adminService;
