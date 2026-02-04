import api from "./axios";

const BOOKS_ENDPOINT = "/api/books";

const booksService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get(`${BOOKS_ENDPOINT}/list/`, { params });
      console.log("Books fetched:", response.data);
      // Return the full response data which includes count, next, previous, and results
      return response.data;
    } catch (error) {
      console.error("Error fetching books:", error);
      throw error;
    }
  },

  // Get book by ID
  getById: async (id) => {
    try {
      const response = await api.get(`${BOOKS_ENDPOINT}/detail/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching book with ID ${id}:`, error);
      throw error;
    }
  },

  // Create new book (Admin only)
  create: async (bookData) => {
    try {
      const response = await api.post(`${BOOKS_ENDPOINT}/add/`, bookData);
      return response.data;
    } catch (error) {
      console.error("Error creating book:", error);
      throw error;
    }
  },

  // Update book (Admin only)
  update: async (id, bookData) => {
    try {
      const response = await api.put(`${BOOKS_ENDPOINT}/detail/${id}/`, bookData);
      return response.data;
    } catch (error) {
      console.error(`Error updating book with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete book (Admin only)
  delete: async (id) => {
    try {
      const response = await api.delete(`${BOOKS_ENDPOINT}/detail/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting book with ID ${id}:`, error);
      throw error;
    }
  },

  // Search books (Using the search param in getAll now)
  search: async (query) => {
    try {
      const response = await api.get(`${BOOKS_ENDPOINT}/list/`, {
        params: { search: query },
      });
      return response.data;
    } catch (error) {
      console.error("Error searching books:", error);
      throw error;
    }
  },

  // Get books by category
  getByCategory: async (category) => {
    try {
      const response = await api.get(`${BOOKS_ENDPOINT}/list/`, {
        params: { category },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching books in category ${category}:`, error);
      throw error;
    }
  },

  // Bulk upload (Admin only)
  bulkUpload: async (booksData) => {
    try {
      const response = await api.post(`${BOOKS_ENDPOINT}/bulk-upload/`, booksData);
      return response.data;
    } catch (error) {
      console.error("Error in bulk upload:", error);
      throw error;
    }
  },

  // Get unique categories
  getCategories: async () => {
    try {
      const response = await api.get(`${BOOKS_ENDPOINT}/categories/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },
};

export default booksService;
