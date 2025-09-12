import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import { spaceService } from "../services/spaceService";

const MySpaces = () => {
  const navigate = useNavigate(); // Add this hook
  const [spaces, setSpaces] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");
  const [newSpaceDescription, setNewSpaceDescription] = useState("");
  // Add missing state variables
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeSpace, setActiveSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("MySpaces component is rendering"); // Debug log
  console.log("Current state:", {
    loading,
    error,
    spacesLength: spaces.length,
  }); // Debug state

  // Load spaces from service on component mount
  useEffect(() => {
    console.log("MySpaces useEffect running"); // Debug log
    const loadSpaces = async () => {
      try {
        console.log("Setting loading to true"); // Debug log
        setLoading(true);
        setError(null);
        console.log("Loading spaces..."); // Debug log
        // We're getting root spaces (could be filtered by user ID in a real app)
        const rootSpaces = await spaceService.getRootSpaces();
        console.log("Loaded spaces:", rootSpaces); // Debug log
        console.log("Setting spaces and loading to false"); // Debug log
        setSpaces(rootSpaces);
      } catch (error) {
        console.error("Error loading spaces:", error);
        console.log("Setting error:", error.message); // Debug log
        setError(error.message);
        // Show an error message and set empty array
        setSpaces([]);
      } finally {
        console.log("Setting loading to false in finally"); // Debug log
        setLoading(false);
      }
    };

    loadSpaces();
  }, []);

  const eventhandler = (action, payload = null) => {
    console.log(action, payload);

    switch (action) {
      case "createSpace":
        setIsCreateModalOpen(true);
        break;
      case "editSpace":
        setSelectedSpace(payload);
        setIsEditModalOpen(true);
        break;
      case "viewSpace":
        setActiveSpace(payload);
        break;
      case "exportSpaces":
        exportSpacesToJSON();
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }
  };

  const handleCreateSpace = async () => {
    if (newSpaceName.trim()) {
      try {
        const newSpace = await spaceService.createSpace({
          name: newSpaceName.trim(),
          description: newSpaceDescription.trim() || "No description provided",
          color: getRandomColor(),
          userId: 1, // Temporary user ID - in real app this would come from authentication
          parentId: null, // Explicitly set as null for root spaces
          isChildSpace: false, // Flag to identify this is a root-level space
        });

        setSpaces((prevSpaces) => [...prevSpaces, newSpace]);
        setNewSpaceName("");
        setNewSpaceDescription("");
        setIsCreateModalOpen(false);
      } catch (error) {
        console.error("Error creating space:", error);
        alert("Failed to create space. Please try again.");
      }
    }
  };

  const handleDeleteSpace = async (spaceId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this space? This will also delete all content and subspaces."
      )
    ) {
      try {
        await spaceService.deleteSpace(spaceId);
        setSpaces((prevSpaces) =>
          prevSpaces.filter((space) => space.space_id !== spaceId)
        );
      } catch (error) {
        console.error("Error deleting space:", error);
        alert("Failed to delete space. Please try again.");
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Add missing functions
  const getRandomColor = () => {
    const colors = [
      "#e74c3c",
      "#3498db",
      "#2ecc71",
      "#f39c12",
      "#9b59b6",
      "#1abc9c",
      "#e67e22",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const exportSpacesToJSON = () => {
    const dataStr = JSON.stringify(spaces, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "my-spaces.json";
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  // Add navigation handler with slug generation
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  };

  const handleSpaceClick = (space) => {
    const slug = generateSlug(space.name);
    console.log("=== SPACE CLICK DEBUG ===");
    console.log("Clicking on space:", space);
    console.log("Generated slug:", slug);
    console.log("Navigating to:", `/spaces/${slug}`);

    // Store space data in sessionStorage for SpaceView to access
    const storageKey = `space_${slug}`;
    console.log("Setting sessionStorage key:", storageKey);
    sessionStorage.setItem(storageKey, JSON.stringify(space));
    console.log("SessionStorage set successfully");

    navigate(`/spaces/${slug}`);
    console.log("Navigation called");
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 70px)",
        padding: "2rem",
        maxWidth: "1200px",
        margin: "0 auto",
        height: "auto",
      }}
    >
      <div>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "700",
            color: "#2c3e50",
            margin: "0 0 1rem 0",
          }}
        >
          Spaces
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            textAlign: "left",
            color: "#7f8c8d",
            margin: "0",
            maxWidth: "600px",
            lineHeight: "1.5",
          }}
        >
          Manage your workspaces, collaborative projects, and shared
          environments. <br />
          Organize your work into different spaces for better productivity.
        </p>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p>Loading spaces...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            style={{
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "1rem",
              borderRadius: "8px",
              margin: "2rem 0",
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Sticky Add Space Section */}
        {!loading && !error && (
          <div
            style={{
              zIndex: 100,
              marginTop: "2rem",
              marginBottom: "2rem",
              padding: "1rem",
              backgroundColor: "#f8f9fa",
              borderRadius: "12px",
              border: "2px dashed #e9ecef",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <p
              style={{
                margin: "0 0 1rem 0",
                color: "#6c757d",
                fontStyle: "italic",
              }}
            >
              add your Space here...
            </p>
            <div
              style={{
                width: "100px",
                height: "100px",
                position: "sticky",
                top: "80px", // Account for navbar height
                backgroundColor: "#7ed481ff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#fff",
                fontSize: "12px",
                borderRadius: "4px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onClick={() => eventhandler("createSpace")}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#45a049";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "#4CAF50";
                e.target.style.transform = "scale(1)";
              }}
            >
              Add Space
            </div>
          </div>
        )}

        {/* Display Created Spaces - 5 per row */}
        {!loading && !error && spaces.length > 0 && (
          <div
            style={{
              marginTop: "1rem",
            }}
          >
            <h3
              style={{
                fontSize: "1.2rem",
                fontWeight: "600",
                color: "#2c3e50",
                margin: "0 0 1rem 0",
              }}
            >
              Your Spaces ({spaces.length})
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
                maxWidth: "100%",
              }}
            >
              {spaces
                .filter(
                  (space) => !space.parent_space_id && !space.is_child_space
                )
                .map((space) => (
                  <div
                    key={space.id || space.space_id}
                    onClick={() => handleSpaceClick(space)} // Pass entire space object
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      padding: "1rem",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      border: "1px solid #e9ecef",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      minHeight: "150px", // Consistent height
                      display: "flex",
                      flexDirection: "column",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(0, 0, 0, 0.15)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0px)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0, 0, 0, 0.1)";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          backgroundColor: space.color,
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: "0.9rem",
                          fontWeight: "bold",
                        }}
                      >
                        {space.name.charAt(0).toUpperCase()}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSpace(space.space_id); // Use space_id specifically
                        }}
                        style={{
                          padding: "0.2rem",
                          backgroundColor: "transparent",
                          border: "none",
                          color: "#dc3545",
                          fontSize: "1rem",
                          cursor: "pointer",
                          borderRadius: "3px",
                          transition: "all 0.2s ease",
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = "#f8d7da";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = "transparent";
                        }}
                      >
                        ×
                      </button>
                    </div>

                    <h4
                      style={{
                        fontSize: "1rem",
                        fontWeight: "600",
                        color: "#2c3e50",
                        margin: "0 0 0.3rem 0",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {space.name}
                    </h4>

                    <p
                      style={{
                        color: "#6c757d",
                        fontSize: "0.8rem",
                        margin: "0 0 0.5rem 0",
                        lineHeight: "1.3",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        flex: 1, // Take remaining space
                      }}
                    >
                      {space.description}
                    </p>

                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "#95a5a6",
                        marginTop: "auto", // Push to bottom
                      }}
                    >
                      Created {formatDate(space.createdAt || space.created_at)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* No spaces message */}
        {!loading && !error && spaces.length === 0 && (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p>No spaces found. Create your first space!</p>
          </div>
        )}
      </div>

      {/* Create Space Modal || name and description of new space */}
      {isCreateModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "2rem",
              width: "90%",
              maxWidth: "400px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: "1.3rem",
                fontWeight: "600",
                color: "#2c3e50",
                margin: "0 0 1.5rem 0",
              }}
            >
              Create New Space
            </h2>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#2c3e50",
                  marginBottom: "0.5rem",
                }}
              >
                Space Name *
              </label>
              <input
                type="text"
                value={newSpaceName}
                onChange={(e) => setNewSpaceName(e.target.value)}
                placeholder="Enter space name"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4CAF50";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#ddd";
                }}
              />
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#2c3e50",
                  marginBottom: "0.5rem",
                }}
              >
                Description
              </label>
              <textarea
                value={newSpaceDescription}
                onChange={(e) => setNewSpaceDescription(e.target.value)}
                placeholder="Describe what this space is for"
                rows="3"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4CAF50";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#ddd";
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "transparent",
                  color: "#6c757d",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "#f8f9fa";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSpace}
                disabled={!newSpaceName.trim()}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: newSpaceName.trim() ? "#4CAF50" : "#bdc3c7",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "1rem",
                  cursor: newSpaceName.trim() ? "pointer" : "not-allowed",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  if (newSpaceName.trim()) {
                    e.target.style.backgroundColor = "#45a049";
                  }
                }}
                onMouseOut={(e) => {
                  if (newSpaceName.trim()) {
                    e.target.style.backgroundColor = "#4CAF50";
                  }
                }}
              >
                Create Space
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySpaces;
