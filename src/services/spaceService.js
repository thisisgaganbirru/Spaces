// spaceService.js - Frontend service for space operations
// Connects to backend API for database operations

const API_BASE_URL = "http://localhost:3001/api";

export const spaceService = {
  // Get all root spaces (spaces without parent)
  async getRootSpaces() {
    console.log("getRootSpaces: Fetching root spaces from API");

    try {
      const response = await fetch(`${API_BASE_URL}/spaces/root`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const rootSpaces = await response.json();
      console.log("getRootSpaces: Found", rootSpaces.length, "root spaces");
      return rootSpaces;
    } catch (error) {
      console.error("getRootSpaces: API error:", error);
      throw error;
    }
  },

  // Create a new space
  async createSpace(spaceData) {
    console.log("createSpace: Creating new space:", spaceData);

    try {
      const response = await fetch(`${API_BASE_URL}/spaces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(spaceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const newSpace = await response.json();
      console.log("createSpace: Space created successfully:", newSpace);
      return newSpace;
    } catch (error) {
      console.error("createSpace: API error:", error);
      throw error;
    }
  },

  // Delete a space
  async deleteSpace(spaceId) {
    console.log("deleteSpace: Deleting space with ID:", spaceId);

    try {
      const response = await fetch(`${API_BASE_URL}/spaces/${spaceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("deleteSpace: Space deleted successfully");
      return true;
    } catch (error) {
      console.error("deleteSpace: API error:", error);
      throw error;
    }
  },

  // Get space by ID
  async getSpaceById(spaceId) {
    console.log("getSpaceById: Fetching space with ID:", spaceId);

    try {
      const response = await fetch(`${API_BASE_URL}/spaces/${spaceId}`);
      if (!response.ok) {
        if (response.status === 404) {
          console.log("getSpaceById: Space not found");
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const space = await response.json();
      console.log("getSpaceById: Found space:", space.name);
      return space;
    } catch (error) {
      console.error("getSpaceById: API error:", error);
      throw error;
    }
  },

  // Get child spaces of a parent space
  async getChildSpaces(parentSpaceId) {
    console.log("getChildSpaces: Fetching children of space:", parentSpaceId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/spaces/${parentSpaceId}/children`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const childSpaces = await response.json();
      console.log("getChildSpaces: Found", childSpaces.length, "child spaces");
      return childSpaces;
    } catch (error) {
      console.error("getChildSpaces: API error:", error);
      throw error;
    }
  },

  // Get spaces by user ID
  async getUserSpaces(userId) {
    console.log("getUserSpaces: Fetching spaces for user:", userId);

    try {
      const response = await fetch(`${API_BASE_URL}/spaces/user/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const userSpaces = await response.json();
      console.log("getUserSpaces: Found", userSpaces.length, "spaces for user");
      return userSpaces;
    } catch (error) {
      console.error("getUserSpaces: API error:", error);
      throw error;
    }
  },

  // Get root spaces by user ID
  async getUserRootSpaces(userId) {
    console.log("getUserRootSpaces: Fetching root spaces for user:", userId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/spaces/user/${userId}/root`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const userRootSpaces = await response.json();
      console.log(
        "getUserRootSpaces: Found",
        userRootSpaces.length,
        "root spaces for user"
      );
      return userRootSpaces;
    } catch (error) {
      console.error("getUserRootSpaces: API error:", error);
      throw error;
    }
  },

  // Update space
  async updateSpace(spaceId, updateData) {
    console.log(
      "updateSpace: Updating space",
      spaceId,
      "with data:",
      updateData
    );

    try {
      const response = await fetch(`${API_BASE_URL}/spaces/${spaceId}`, {
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

      const updatedSpace = await response.json();
      console.log("updateSpace: Space updated successfully");
      return updatedSpace;
    } catch (error) {
      console.error("updateSpace: API error:", error);
      throw error;
    }
  },

  // Search spaces by name (for slug-based lookup)
  async searchSpacesByName(searchTerm) {
    console.log(
      "searchSpacesByName: Searching for spaces with name:",
      searchTerm
    );

    try {
      const response = await fetch(
        `${API_BASE_URL}/spaces/search?name=${encodeURIComponent(searchTerm)}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const spaces = await response.json();
      console.log(
        "searchSpacesByName: Found",
        spaces.length,
        "matching spaces"
      );
      return spaces;
    } catch (error) {
      console.error("searchSpacesByName: API error:", error);
      throw error;
    }
  },

  // Generate slug from space name (for consistent URL generation)
  generateSlug(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  },

  // Add content to a space
  async addContent(spaceId, contentData) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/spaces/${spaceId}/content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(contentData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const savedContent = await response.json();
      console.log("Content saved successfully:", savedContent);
      return savedContent;
    } catch (error) {
      console.error("Error adding content to space:", error);
      throw error;
    }
  },

  // Get content for a space
  async getSpaceContent(spaceId) {
    try {
      const response = await fetch(`${API_BASE_URL}/spaces/${spaceId}/content`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const content = await response.json();
      console.log("Space content retrieved:", content);
      return content;
    } catch (error) {
      console.error("Error fetching space content:", error);
      throw error;
    }
  },

  // Get full content data including file data for preview
  async getFullContentData(spaceId, contentId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/spaces/${spaceId}/content/${contentId}/full`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const content = await response.json();
      console.log("Full content data retrieved:", content);
      return content;
    } catch (error) {
      console.error("Error fetching full content data:", error);
      throw error;
    }
  },

  // Soft delete content from a space (mark as inactive)
  async deleteContent(spaceId, contentId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/spaces/${spaceId}/content/${contentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "soft_delete" }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Content soft deleted successfully:", result);
      return true;
    } catch (error) {
      console.error("Error soft deleting content:", error);
      throw error;
    }
  },

  // Permanently delete content from a space
  async deleteContentPermanently(spaceId, contentId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/spaces/${spaceId}/content/${contentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Content permanently deleted successfully:", result);
      return true;
    } catch (error) {
      console.error("Error permanently deleting content:", error);
      throw error;
    }
  },

  async addFileUpload(fileData) {
    console.log("addFileUpload: File upload API endpoints not yet implemented");
    return null;
  },
};
