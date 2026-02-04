import api from "./axios";

const BORROW_ENDPOINT = "/api/borrow";

const borrowService = {
  // Get all borrowed books for current user
  getBorrowedBooks: async (params = {}) => {
    try {
      const response = await api.get(`${BORROW_ENDPOINT}/borrow/`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching borrowed books:", error);
      throw error;
    }
  },

  // Borrow a book
  borrowBook: async (bookId) => {
    try {
      const response = await api.post(`${BORROW_ENDPOINT}/borrow/`, {
        book_id: bookId,
        user_id: 8, // Assuming user ID is derived from the auth token
      });
      return response.data;
    } catch (error) {
      console.error("Error borrowing book:", error);
      throw error;
    }
  },

  // Return a book
  returnBook: async (borrowId) => {
    try {
      const response = await api.post(`${BORROW_ENDPOINT}/return/${borrowId}/`);
      return response.data;
    } catch (error) {
      console.error("Error returning book:", error);
      throw error;
    }
  },

  // Renew a book
  renewBook: async (borrowId) => {
    try {
      const response = await api.post(`${BORROW_ENDPOINT}/renew/${borrowId}/`);
      return response.data;
    } catch (error) {
      console.error("Error renewing book:", error);
      throw error;
    }
  },

  // Get borrowing history
  getBorrowingHistory: async (params = {}) => {
    try {
      const response = await api.get(`${BORROW_ENDPOINT}/history/`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching borrowing history:", error);
      throw error;
    }
  },
  
  // Get student overview stats
  getStudentStats: async () => {
    try {
      const response = await api.get(`${BORROW_ENDPOINT}/stats/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching student stats:", error);
      throw error;
    }
  }
};

export default borrowService;
