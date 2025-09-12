// User service - Frontend service for user operations
// Connects to backend API for database operations

const API_BASE_URL = "http://localhost:3001/api";

export const userService = {
  // Create new user
  async createUser(userData) {
    console.log("createUser: Creating new user:", userData);

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const newUser = await response.json();
      console.log("createUser: User created successfully:", newUser);
      return newUser;
    } catch (error) {
      console.error("createUser: API error:", error);
      throw error;
    }
  },

  // Get user by email
  async getUserByEmail(email) {
    console.log("getUserByEmail: Fetching user with email:", email);

    try {
      const response = await fetch(
        `${API_BASE_URL}/users/email/${encodeURIComponent(email)}`
      );

      if (response.status === 404) {
        console.log("getUserByEmail: User not found");
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const user = await response.json();
      console.log(
        "getUserByEmail: Found user:",
        user.first_name,
        user.last_name
      );
      return user;
    } catch (error) {
      console.error("getUserByEmail: API error:", error);
      throw error;
    }
  },

  // Get user by ID
  async getUserById(userId) {
    console.log("getUserById: Fetching user with ID:", userId);

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`);

      if (response.status === 404) {
        console.log("getUserById: User not found");
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const user = await response.json();
      console.log("getUserById: Found user:", user.first_name, user.last_name);
      return user;
    } catch (error) {
      console.error("getUserById: API error:", error);
      throw error;
    }
  },

  // Update user
  async updateUser(userId, updateData) {
    console.log("updateUser: Updating user", userId, "with data:", updateData);

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const updatedUser = await response.json();
      console.log("updateUser: User updated successfully");
      return updatedUser;
    } catch (error) {
      console.error("updateUser: API error:", error);
      throw error;
    }
  },

  // Helper method to check if user exists, if not create one
  async getOrCreateUser(userData) {
    console.log(
      "getOrCreateUser: Checking for existing user with email:",
      userData.email
    );

    try {
      // First try to get existing user
      let user = await this.getUserByEmail(userData.email);

      if (!user) {
        console.log("getOrCreateUser: User not found, creating new user");
        user = await this.createUser(userData);
      } else {
        console.log("getOrCreateUser: Found existing user");
      }

      return user;
    } catch (error) {
      console.error("getOrCreateUser: Error:", error);
      throw error;
    }
  },
};
