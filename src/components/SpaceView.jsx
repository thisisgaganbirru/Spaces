import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { spaceService } from "../services/spaceService";
import SpaceContent from "./SpaceContent";
import SpaceChild from "./SpaceChild";
import {
  FileText,
  ExternalLink,
  Code2,
  Image,
  Play,
  Volume2,
  Plus,
  Upload,
  ArrowLeft,
  Calendar,
  FileText as NotesIcon,
} from "lucide-react";

// Utility: adjust hex color brightness
const adjustColor = (color, amount) => {
  if (!color) return "#000000";
  let c = color.replace(/^#/, "");
  if (c.length === 3)
    c = c
      .split("")
      .map((ch) => ch + ch)
      .join("");
  const num = parseInt(c, 16);
  if (Number.isNaN(num)) return "#000000";
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

const SpaceView = () => {
  const { spaceId, parentSlug, childSlug } = useParams();
  const navigate = useNavigate();

  // Determine the actual space identifier - could be single space or nested
  const currentSpaceSlug = childSlug || spaceId;
  const isNestedSpace = Boolean(childSlug && parentSlug);

  const [space, setSpace] = useState(null);
  const [childSpaces, setChildSpaces] = useState([]);
  const [spaceContent, setSpaceContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState(null);
  const [contentData, setContentData] = useState({
    text: "",
    url: "",
    file: null,
  });
  const [errorMessage, setErrorMessage] = useState("");

  const [previewContent, setPreviewContent] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  // State for create space modal
  const [isCreateSpaceModalOpen, setIsCreateSpaceModalOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");
  const [newSpaceDescription, setNewSpaceDescription] = useState("");

  // Function to load child spaces and content for a given space
  const loadSpaceDetails = async (spaceData) => {
    try {
      console.log("Loading details for space:", spaceData.name);

      // Load child spaces
      if (spaceData.space_id) {
        const children = await spaceService.getChildSpaces(spaceData.space_id);
        console.log("Child spaces found:", children.length);
        setChildSpaces(children || []);
        // Load space content from API
        const content = await spaceService.getSpaceContent(spaceData.space_id);
        console.log("Content items found:", content.length);
        setSpaceContent(content || []);
      }
    } catch (error) {
      console.error("Error loading space details:", error);
      setChildSpaces([]);
      setSpaceContent([]);
    }
  };

  // Load space data on mount
  useEffect(() => {
    console.log("=== SPACEVIEW USEEFFECT DEBUG ===");
    console.log("SpaceView useEffect triggered with:", {
      currentSpaceSlug,
      isNestedSpace,
      parentSlug,
      childSlug,
    });

    const loadSpace = async () => {
      try {
        console.log("Starting loadSpace function");
        setLoading(true);

        // First try to get space data from sessionStorage (when navigated from Spaces page)
        const cacheKey = isNestedSpace
          ? `space_${parentSlug}_${childSlug}`
          : `space_${currentSpaceSlug}`;
        console.log("Trying to load from cache with key:", cacheKey);

        const cachedSpace = sessionStorage.getItem(cacheKey);
        console.log("SessionStorage value:", cachedSpace);

        if (cachedSpace) {
          console.log("✅ Loading space from cache:", cacheKey);
          const spaceData = JSON.parse(cachedSpace);
          console.log("✅ Cached space data:", spaceData);
          setSpace(spaceData);

          // Load child spaces and content for cached space
          await loadSpaceDetails(spaceData);

          setLoading(false);
          console.log("✅ Space loaded successfully from cache");
          return;
        } else {
          console.log("❌ No cached space found for key:", cacheKey);
          console.log(
            "Available sessionStorage keys:",
            Object.keys(sessionStorage)
          );
        }

        // If nested space, try to load child spaces
        if (isNestedSpace) {
          console.log("Loading nested space:", parentSlug, "->", childSlug);

          // First get parent space to find children
          const parentSpaces = await spaceService.getRootSpaces();
          const parentSpace = parentSpaces.find((space) => {
            const spaceSlug = spaceService.generateSlug(space.name);
            return spaceSlug === parentSlug;
          });

          if (parentSpace) {
            // Get child spaces of the parent
            const childSpaces = await spaceService.getChildSpaces(
              parentSpace.space_id
            );
            const childSpace = childSpaces.find((space) => {
              const spaceSlug = spaceService.generateSlug(space.name);
              return spaceSlug === childSlug;
            });

            if (childSpace) {
              console.log("Found nested space:", childSpace.name);
              setSpace(childSpace);
              await loadSpaceDetails(childSpace);
              setLoading(false);
              return;
            }
          }
        }

        // If not in cache, try to find by space_id (fallback for direct URL access)
        console.log(
          "Cache miss, trying to load space by slug:",
          currentSpaceSlug
        );
        try {
          const foundSpace = await spaceService.getSpaceById(currentSpaceSlug);
          if (foundSpace) {
            setSpace(foundSpace);
            await loadSpaceDetails(foundSpace);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.log(
            "Failed to find by ID, will try name search:",
            error.message
          );
        }

        // If space not found by ID, try searching by name (slug might be a name-based slug)
        console.log(
          "Trying to find space by name matching slug:",
          currentSpaceSlug
        );
        const rootSpaces = await spaceService.getRootSpaces();
        const matchingSpace = rootSpaces.find((space) => {
          const spaceSlug = spaceService.generateSlug(space.name);
          return spaceSlug === currentSpaceSlug;
        });

        if (matchingSpace) {
          console.log("Found matching space by name:", matchingSpace.name);
          setSpace(matchingSpace);

          // Load child spaces and content for this space
          await loadSpaceDetails(matchingSpace);
        } else {
          console.log("No space found matching slug:", currentSpaceSlug);
          setSpace(null);
        }
      } catch (error) {
        console.error("Error loading space:", error);
        setSpace(null);
      } finally {
        setLoading(false);
      }
    };

    loadSpace();
  }, [currentSpaceSlug, isNestedSpace, parentSlug, childSlug]);

  // Content type options - simplified to three main categories
  const contentTypes = [
    {
      type: "notes",
      label: "Notes",
      description: "Add text content, notes, or copy-paste content",
      color: "#3498db",
      icon: "📝",
    },
    {
      type: "upload",
      label: "Upload",
      description:
        "Upload any file type - documents, code, images, videos, audio",
      color: "#e74c3c",
      icon: "📁",
    },
    {
      type: "url",
      label: "URL",
      description: "Store links to websites, portfolios, or resources",
      color: "#2ecc71",
      icon: "🔗",
    },
  ];

  // File type configurations with size limits and extensions
  const fileTypeConfig = {
    document: {
      maxSize: 50 * 1024 * 1024, // 50MB
      extensions: [
        ".pdf",
        ".doc",
        ".docx",
        ".ppt",
        ".pptx",
        ".xls",
        ".xlsx",
        ".txt",
        ".rtf",
        ".md",
        ".odt",
        ".ods",
        ".odp",
      ],
      description: "Documents (PDF, Word, PowerPoint, Excel, Text)",
      icon: "📄",
    },
    code: {
      maxSize: 10 * 1024 * 1024, // 10MB
      extensions: [
        ".html",
        ".css",
        ".js",
        ".jsx",
        ".ts",
        ".tsx",
        ".vue",
        ".scss",
        ".sass",
        ".less",
        ".json",
        ".xml",
        ".yaml",
        ".yml",
        ".py",
        ".java",
        ".cpp",
        ".c",
        ".cs",
        ".go",
        ".rb",
        ".php",
        ".swift",
        ".kt",
        ".dart",
        ".r",
        ".sql",
        ".ipynb",
        ".sh",
        ".ps1",
        ".bat",
      ],
      description: "Code files (HTML, CSS, JS, Python, Java, etc.)",
      icon: "💻",
    },
    audio: {
      maxSize: 100 * 1024 * 1024, // 100MB
      extensions: [".mp3", ".aac", ".m4a", ".wav", ".ogg"],
      description: "Audio files (MP3, AAC, WAV, OGG)",
      icon: "🎵",
    },
    video: {
      maxSize: 500 * 1024 * 1024, // 500MB
      extensions: [".mp4", ".mov", ".avi", ".webm", ".mkv"],
      description: "Video files (MP4, MOV, AVI, WebM)",
      icon: "🎥",
    },
    image: {
      maxSize: 25 * 1024 * 1024, // 25MB
      extensions: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"],
      description: "Image files (JPG, PNG, GIF, WebP)",
      icon: "🖼️",
    },
  };

  const handleAddContent = () => {
    setIsAddModalOpen(true);
  };

  const handleContentTypeSelect = (type) => {
    setSelectedContentType(type);
  };

  const handleContentSubmit = async () => {
    try {
      // Prepare content data based on selected type
      let contentTypeData = {};

      switch (selectedContentType) {
        case "notes":
          contentTypeData = {
            text: contentData.text || "",
            wordCount: (contentData.text || "")
              .split(/\s+/)
              .filter((word) => word.length > 0).length,
            characterCount: (contentData.text || "").length,
          };
          break;
        case "url":
          try {
            const urlObj = new URL(contentData.url);
            contentTypeData = {
              url: contentData.url || "",
              domain: urlObj.hostname,
              protocol: urlObj.protocol,
              isSecure: urlObj.protocol === "https:",
            };
          } catch {
            contentTypeData = {
              url: contentData.url || "",
              domain: "Invalid URL",
              protocol: "unknown",
              isSecure: false,
            };
          }
          break;
        case "upload":
          if (contentData.file) {
            try {
              const detectedType = validateFile(contentData.file);
              contentTypeData = {
                fileName: contentData.file.name,
                fileSize: contentData.file.size,
                fileType:
                  contentData.file.type ||
                  `application/${contentData.file.name.split(".").pop()}`,
                fileExtension: contentData.file.name
                  .toLowerCase()
                  .split(".")
                  .pop(),
                detectedCategory: detectedType.category,
                uploadedAt: new Date().toISOString(),
                fileSizeFormatted: formatFileSize(contentData.file.size),
              };

              // Store file data - wait for FileReader to complete
              const fileData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = function (e) {
                  resolve(e.target.result);
                };
                reader.onerror = function (e) {
                  reject(new Error("Failed to read file"));
                };
                reader.readAsDataURL(contentData.file);
              });

              contentTypeData.fileData = fileData;
            } catch (validationError) {
              alert(validationError.message);
              return;
            }
          }
          break;
        default:
          console.warn("Unknown content type:", selectedContentType);
      }

      // Use the service to add content - use the actual space ID from loaded space data
      const addedContent = await spaceService.addContent(space.space_id, {
        type: selectedContentType,
        data: contentTypeData,
      });

      // Reload the space to get updated content
      const updatedSpace = await spaceService.getSpaceById(space.space_id);
      setSpace(updatedSpace);

      // Also refresh this view's spaceContent so inline SpaceContent updates immediately
      try {
        const refreshedContent = await spaceService.getSpaceContent(
          space.space_id
        );
        setSpaceContent(refreshedContent || []);
      } catch (e) {
        console.warn("Failed to refresh space content after add:", e);
      }

      console.log("Content added:", addedContent);

      // Reset and close modal
      setSelectedContentType(null);
      setContentData({ text: "", url: "", file: null });
      setIsAddModalOpen(false);

      // Show success message with content ID
      alert(
        `${selectedContentType} content added successfully!\nContent ID: ${
          addedContent.content_id || addedContent.id
        }`
      );
    } catch (error) {
      console.error("Error saving content:", error);
      alert("Error saving content. Please try again.");
    }
  };

  // Function to detect file type based on extension
  const detectFileType = (extension) => {
    const ext = `.${extension}`;

    for (const [category, config] of Object.entries(fileTypeConfig)) {
      if (config.extensions.includes(ext)) {
        return { category, config };
      }
    }

    // Default to document if not found
    return { category: "document", config: fileTypeConfig.document };
  };

  // Function to validate file upload
  const validateFile = (file) => {
    const fileExtension = file.name.toLowerCase().split(".").pop();
    const detectedType = detectFileType(fileExtension);

    // Check file size
    if (file.size > detectedType.config.maxSize) {
      const maxSizeMB = (detectedType.config.maxSize / (1024 * 1024)).toFixed(
        0
      );
      throw new Error(
        `File too large. Maximum size for ${detectedType.category} files is ${maxSizeMB}MB`
      );
    }

    return detectedType;
  };

  // Function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Function to calculate total space size
  const calculateTotalSize = () => {
    if (!spaceContent || spaceContent.length === 0) return 0;

    return spaceContent.reduce((total, item) => {
      // Add file size for upload type content (check data.fileSize)
      if (item.type === "upload" && item.data?.fileSize) {
        const fileSize = parseInt(item.data.fileSize);
        return total + fileSize;
      }

      // For other content types, estimate based on content length
      if (item.content) {
        const contentSize = new Blob([item.content]).size;
        return total + contentSize;
      }

      // Check if there's text content in data field
      if (item.data?.content) {
        const contentSize = new Blob([item.data.content]).size;
        return total + contentSize;
      }

      // Check for text in description or other fields
      if (item.description) {
        const descSize = new Blob([item.description]).size;
        return total + descSize;
      }

      return total;
    }, 0);
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setContentData((prev) => ({ ...prev, file }));
  };

  // Function to get a random color for new spaces
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

  // Handler for creating a new space
  const handleCreateSpace = async () => {
    if (newSpaceName.trim()) {
      try {
        // Create a new space using the service
        const newSpace = await spaceService.createSpace({
          name: newSpaceName.trim(),
          description: newSpaceDescription.trim() || "No description provided",
          color: getRandomColor(),
          parentId: space?.space_id, // Reference to the current space's space_id as parent
          isChildSpace: true, // Flag to identify this is a child space
          userId: space?.user_id || 1, // Fallback to userId 1 if not available
        });

        // Refresh details to include new child in sidebar
        await loadSpaceDetails(space);

        // Reset form and close modal
        setNewSpaceName("");
        setNewSpaceDescription("");
        setIsCreateSpaceModalOpen(false);

        // Navigate to the new space using slugs
        const parentSlugStr = spaceService.generateSlug(space.name);
        const childSlugStr = spaceService.generateSlug(newSpace.name);
        navigate(`/spaces/${parentSlugStr}/${childSlugStr}`);
      } catch (error) {
        console.error("Error creating space:", error);
        alert("Failed to create space. Please try again.");
      }
    }
  };

  const renderContentForm = () => {
    if (!selectedContentType) return null;

    const contentType = contentTypes.find(
      (ct) => ct.type === selectedContentType
    );

    return (
      <div style={{ marginTop: "1.5rem" }}>
        <h4
          style={{
            fontSize: "1.2rem",
            fontWeight: "600",
            color: "#2c3e50",
            margin: "0 0 1rem 0",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {contentType.icon} Add {contentType.label}
        </h4>

        {/* Notes Form */}
        {selectedContentType === "notes" && (
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
              Notes Content *
            </label>
            <textarea
              value={contentData.text || ""}
              onChange={(e) =>
                setContentData((prev) => ({ ...prev, text: e.target.value }))
              }
              placeholder="Enter your notes, copy-paste content, or write anything here..."
              rows="8"
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
                fontFamily: "inherit",
              }}
              onFocus={(e) => (e.target.style.borderColor = contentType.color)}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
            />
            <div
              style={{
                marginTop: "0.5rem",
                fontSize: "0.8rem",
                color: "#6c757d",
              }}
            >
              {contentData.text
                ? `${contentData.text.length} characters, ${
                    contentData.text
                      .split(/\s+/)
                      .filter((word) => word.length > 0).length
                  } words`
                : "0 characters, 0 words"}
            </div>
          </div>
        )}

        {/* URL Form */}
        {selectedContentType === "url" && (
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
              URL Link *
            </label>
            <input
              type="url"
              value={contentData.url || ""}
              onChange={(e) =>
                setContentData((prev) => ({ ...prev, url: e.target.value }))
              }
              placeholder="https://example.com - Portfolio, GitHub, LinkedIn, etc."
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
              onFocus={(e) => (e.target.style.borderColor = contentType.color)}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
            />
            <div
              style={{
                marginTop: "0.5rem",
                fontSize: "0.8rem",
                color: "#6c757d",
              }}
            >
              Supported: Portfolio URLs, GitHub, LinkedIn, Demo Links, YouTube,
              Documentation
            </div>
          </div>
        )}

        {/* Upload Form */}
        {selectedContentType === "upload" && (
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
              File Upload *
            </label>

            {/* File Categories Info */}
            <div
              style={{
                marginBottom: "1rem",
                padding: "1rem",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #e9ecef",
              }}
            >
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#495057",
                  lineHeight: "1.4",
                }}
              >
                <strong>Supported File Types:</strong>
                <div
                  style={{
                    marginTop: "0.5rem",
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "0.25rem",
                  }}
                >
                  {Object.entries(fileTypeConfig).map(([category, config]) => (
                    <div
                      key={category}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span>{config.icon}</span>
                      <span
                        style={{
                          fontWeight: "600",
                          textTransform: "capitalize",
                        }}
                      >
                        {category}:
                      </span>
                      <span style={{ fontSize: "0.8rem" }}>
                        {config.description} (Max:{" "}
                        {(config.maxSize / (1024 * 1024)).toFixed(0)}MB)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* File Upload Area */}
            <div
              style={{
                border: `2px dashed ${
                  contentData.file ? contentType.color : "#ddd"
                }`,
                borderRadius: "8px",
                padding: "2rem",
                textAlign: "center",
                backgroundColor: contentData.file ? "#f0f8ff" : "#f8f9fa",
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
              onClick={() => document.getElementById("file-upload").click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.style.backgroundColor = "#e3f2fd";
                e.currentTarget.style.borderColor = contentType.color;
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.style.backgroundColor = "#e3f2fd";
                e.currentTarget.style.borderColor = contentType.color;
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Only reset if leaving the main container (not child elements)
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  e.currentTarget.style.backgroundColor = contentData.file
                    ? "#f0f8ff"
                    : "#f8f9fa";
                  e.currentTarget.style.borderColor = contentData.file
                    ? contentType.color
                    : "#ddd";
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();

                // Reset visual state
                e.currentTarget.style.backgroundColor = contentData.file
                  ? "#f0f8ff"
                  : "#f8f9fa";
                e.currentTarget.style.borderColor = contentData.file
                  ? contentType.color
                  : "#ddd";

                const files = e.dataTransfer.files;
                if (files && files.length > 0) {
                  const file = files[0];
                  try {
                    const detectedType = validateFile(file);
                    setContentData((prev) => ({ ...prev, file }));
                    setErrorMessage("");
                  } catch (validationError) {
                    setErrorMessage(validationError.message);
                  }
                }
              }}
            >
              <input
                type="file"
                accept="*/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    try {
                      const detectedType = validateFile(file);
                      setContentData((prev) => ({ ...prev, file }));
                      setErrorMessage("");
                    } catch (validationError) {
                      setErrorMessage(validationError.message);
                      e.target.value = "";
                    }
                  }
                }}
                style={{ display: "none" }}
                id="file-upload"
              />

              {contentData.file ? (
                <div style={{ color: "#2c3e50" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                    ✅
                  </div>
                  <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                    {contentData.file.name}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#6c757d" }}>
                    {formatFileSize(contentData.file.size)} •{" "}
                    {contentData.file.type}
                  </div>
                  <div
                    style={{
                      marginTop: "0.5rem",
                      fontSize: "0.8rem",
                      color: contentType.color,
                    }}
                  >
                    Click to change file
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                    📁
                  </div>
                  <div
                    style={{
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                      color: "#2c3e50",
                    }}
                  >
                    Click to select a file
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#6c757d" }}>
                    Or drag and drop your file here
                  </div>
                </div>
              )}
            </div>

            {errorMessage && (
              <div
                style={{
                  marginTop: "0.5rem",
                  padding: "0.5rem",
                  backgroundColor: "#f8d7da",
                  color: "#721c24",
                  borderRadius: "4px",
                  fontSize: "0.85rem",
                }}
              >
                {errorMessage}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    console.log("SpaceView: Still loading...");
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          fontSize: "1.2rem",
          color: "#6c757d",
        }}
      >
        Loading space...
      </div>
    );
  }

  if (!space) {
    console.log("SpaceView: No space found");
    return (
      <div
        style={{
          padding: "2rem",
          maxWidth: "1200px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            color: "#e74c3c",
            marginBottom: "1rem",
          }}
        >
          Space Not Found
        </h1>
        <p
          style={{
            color: "#6c757d",
            marginBottom: "2rem",
          }}
        >
          The space you're looking for doesn't exist or has been deleted.
        </p>
        <button
          onClick={() => navigate("/spaces")}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#3498db",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "1rem",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#2980b9";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "#3498db";
          }}
        >
          ← Back to Spaces
        </button>
      </div>
    );
  }

  console.log("Rendering SpaceView for empty parent space:", space);

  return (
    <div
      style={{
        padding: "0rem",
        maxWidth: "1200px",
        margin: "-10px auto",
      }}
    >
      {/* Header Section with Modern Style */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <button
          onClick={() =>
            navigate(
              space && space.parent_space_id
                ? `/spaces/${space.parent_space_id}`
                : "/spaces"
            )
          }
          style={{
            padding: "0.75rem",
            backgroundColor: "white",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#F9FAFB";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "white";
            e.target.style.transform = "translateY(0)";
          }}
        >
          <ArrowLeft size={10} color="#4B5563" />
        </button>
        {/* Breadcrumb Navigation */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.9rem",
              color: "#6B7280",
            }}
          >
            <button
              onClick={() => navigate("/spaces")}
              style={{
                background: "none",
                border: "none",
                padding: "0",
                color: "#4B5563",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              Spaces
            </button>

            {/* Show parent space if this is a nested space */}
            {isNestedSpace && parentSlug && (
              <>
                <span>/</span>
                <button
                  onClick={() => {
                    const parentPath = `/spaces/${parentSlug}`;
                    navigate(parentPath);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "0",
                    color: "#4B5563",
                    fontWeight: "500",
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {parentSlug.replace(/-/g, " ")}
                </button>
                <span>/</span>
                <span style={{ color: "#1F2937", fontWeight: "600" }}>
                  {space?.name || childSlug?.replace(/-/g, " ")}
                </span>
              </>
            )}

            {/* Show current space if not nested */}
            {!isNestedSpace && space && (
              <>
                <span>/</span>
                <span style={{ color: "#1F2937", fontWeight: "600" }}>
                  {space.name}
                </span>
              </>
            )}

            {space && space.parent_space_id && (
              <>
                <span>/</span>
                {(() => {
                  // Get the parent space if this is a child space
                  // Note: Parent space should be loaded from API in real implementation
                  return space.parent_space_id ? (
                    <button
                      onClick={() =>
                        navigate(`/spaces/${space.parent_space_id}`)
                      }
                      style={{
                        background: "none",
                        border: "none",
                        padding: "0",
                        color: "#4B5563",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      {parentSpace.name}
                    </button>
                  ) : null;
                })()}
                <span>/</span>
                <span style={{ color: "#111827" }}>{space.name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Space Details with Modern Style */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Space Avatar */}
        <div
          style={{
            width: "80px",
            height: "80px",
            background: `linear-gradient(135deg, ${
              space.color
            } 0%, ${adjustColor(space.color, -30)} 100%)`,
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "2rem",
            fontWeight: "bold",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          {space.name.charAt(0).toUpperCase()}
        </div>

        {/* Space Name and Details */}
        <div>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "800",
              textTransform: "capitalize",
              whiteSpace: "nowrap",
              color: "#1F2937",
              margin: "0",
              lineHeight: "1.2",
            }}
          >
            {space.name}
          </h1>

          {/* Space Date Information */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "0.5rem",
            }}
          >
            <Calendar size={14} color="#6B7280" />
            <p
              style={{
                color: "#6B7280",
                margin: "0",
                fontSize: "0.9rem",
              }}
            >
              Created{" "}
              {space.created_at
                ? new Date(space.created_at).toLocaleDateString()
                : "Unknown"}
              {space.updated_at && (
                <span style={{ marginLeft: "0.5rem" }}>
                  • Updated {new Date(space.updated_at).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
      <div
        style={{
          backgroundColor: "#F9FAFB",
          padding: "1.5rem",
          borderRadius: "12px",
          marginBottom: "2.5rem",
          border: "1px solid #E5E7EB",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          transition: "all 0.2s ease",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.05)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <h3
          style={{
            fontSize: "1.1rem",
            fontWeight: "600",
            color: "#111827",
            margin: "0 0 0.75rem 0",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <NotesIcon size={16} color="#4B5563" />
          About this space
        </h3>
        <p
          style={{
            color: "#4B5563",
            lineHeight: "1.6",
            margin: "0",
            fontSize: "0.95rem",
          }}
        >
          {space.description || "No description provided"}
        </p>
      </div>
      {/* Universal Upload Block */}
      <div
        style={{
          border: "2px dashed #E5E7EB",
          borderRadius: "12px",
          padding: "1rem",
          marginBottom: "2rem",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
        onClick={handleAddContent}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = "#60A5FA";
          e.currentTarget.style.backgroundColor = "#EFF6FF";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = "#E5E7EB";
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <div
          style={{
            marginBottom: "1rem",
            fontSize: "3rem",
            transition: "transform 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          📁
        </div>
        <div
          style={{
            fontWeight: "700",
            fontSize: "1.25rem",
            color: "#4B5563",
            marginBottom: "0.5rem",
          }}
        >
          Universal Upload
        </div>
        <div
          style={{ fontSize: "0.9rem", color: "#6B7280", marginBottom: "1rem" }}
        >
          Drop any file or paste any content
        </div>

        {/* File Type Examples */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "0.5rem",
            maxWidth: "400px",
            margin: "0 auto",
            marginBottom: "1rem",
            fontSize: "0.75rem",
            color: "#6B7280",
          }}
        >
          {[
            { icon: <FileText size={14} />, label: "Documents" },
            { icon: <Image size={14} />, label: "Images" },
            { icon: <Play size={14} />, label: "Videos" },
            { icon: <Volume2 size={14} />, label: "Audio" },
            { icon: <Code2 size={14} />, label: "Code" },
            { icon: <ExternalLink size={14} />, label: "URLs" },
          ].map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.25rem",
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
          Auto-detects file type • Creates appropriate content block
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          justifyContent: "center",
        }}
      >
        {/* Only show Add Subspace button for root spaces (spaces without a parent) */}
        {!space.parent_space_id && !space.is_child_space && (
          <button
            className="add-space-button"
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#1F2937",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "600",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
            onClick={() => setIsCreateSpaceModalOpen(true)}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
              e.target.style.backgroundColor = "#111827";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
              e.target.style.backgroundColor = "#1F2937";
            }}
          >
            <Plus size={16} /> Add Subspace
          </button>
        )}
        <button
          className="add-content-button"
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#2563EB",
            border: "none",
            borderRadius: "8px",
            color: "#fff",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: "600",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            margin:
              space.parent_space_id || space.is_child_space ? "0 auto" : "0", // Center if it's the only button
          }}
          onClick={handleAddContent}
          onMouseOver={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.3)";
            e.target.style.backgroundColor = "#1D4ED8";
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
            e.target.style.backgroundColor = "#2563EB";
          }}
        >
          <Upload size={16} /> Add Content
        </button>
      </div>

      {/* Stats Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "1rem",
          padding: "1rem",
          background: "linear-gradient(to right, #F9FAFB, #F3F4F6)",
          borderRadius: "12px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "1rem",
            borderRadius: "8px",
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#1F2937",
              marginBottom: "0.25rem",
            }}
          >
            {spaceContent?.length || 0}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#6B7280" }}>
            Content Items
          </div>
        </div>
        <div
          style={{
            background: "white",
            padding: "1rem",
            borderRadius: "8px",
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#1F2937",
              marginBottom: "0.25rem",
            }}
          >
            {childSpaces?.length || 0}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#6B7280" }}>
            Child Spaces
          </div>
        </div>
        <div
          style={{
            background: "white",
            padding: "1rem",
            borderRadius: "8px",
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#1F2937",
              marginBottom: "0.25rem",
            }}
          >
            {spaceContent?.filter((item) => item.type === "upload")?.length ||
              0}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#6B7280" }}>
            Files Uploaded
          </div>
        </div>
        <div
          style={{
            background: "white",
            padding: "1rem",
            borderRadius: "8px",
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#1F2937",
              marginBottom: "0.25rem",
            }}
          >
            {formatFileSize(calculateTotalSize())}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#6B7280" }}>Total Size</div>
        </div>
      </div>

      {/* 60/40 Layout: SpaceContent + SpaceChild */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "3fr 2fr",
          gap: "1rem",
          alignItems: "start",
          marginTop: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div>
          <SpaceContent
            space={space}
            spaceContent={spaceContent}
            showAddControls={false}
          />
        </div>
        <div>
          <SpaceChild
            space={space}
            childSpaces={childSpaces}
            onAddSubspace={
              !space.parent_space_id && !space.is_child_space
                ? () => setIsCreateSpaceModalOpen(true)
                : undefined
            }
          />
        </div>
      </div>

      {/* Add Content Modal [ subpopup ] */}
      {isAddModalOpen && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: "1000",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsAddModalOpen(false);
              setSelectedContentType(null);
              setContentData({
                text: "",
                url: "",
                file: null,
              });
            }
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "2rem",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "#2c3e50",
                  margin: "0",
                }}
              >
                Add Content to {space.name}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setSelectedContentType(null);
                  setContentData({
                    text: "",
                    url: "",
                    file: null,
                  });
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "#6c757d",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "#f8f9fa";
                  e.target.style.color = "#e74c3c";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#6c757d";
                }}
              >
                ×
              </button>
            </div>

            {!selectedContentType ? (
              <>
                <p
                  style={{
                    color: "#6c757d",
                    marginBottom: "1.5rem",
                    fontSize: "1rem",
                  }}
                >
                  Choose the type of content you want to add:
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "12px",
                    maxWidth: "560px",
                    margin: "0 auto",
                  }}
                >
                  {contentTypes.map((contentType) => (
                    <button
                      key={contentType.type}
                      onClick={() => handleContentTypeSelect(contentType.type)}
                      style={{
                        width: "100%",
                        padding: "16px",
                        border: "2px dashed #dbe4f0",
                        borderRadius: "12px",
                        backgroundColor: "#fbfdff",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s ease",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = "#bfd7ff";
                        e.currentTarget.style.backgroundColor = "#f4f8ff";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = "#dbe4f0";
                        e.currentTarget.style.backgroundColor = "#fbfdff";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div style={{ fontSize: "24px" }}>
                          {contentType.icon}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#1f2937" }}>
                            {contentType.label}
                          </div>
                          <div style={{ fontSize: "14px", color: "#6b7280" }}>
                            {contentType.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {renderContentForm()}
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    marginTop: "2rem",
                    justifyContent: "flex-end",
                  }}
                >
                  {/* back button */}
                  <button
                    onClick={() => {
                      setSelectedContentType(null);
                      setContentData({
                        text: "",
                        url: "",
                        file: null,
                      });
                    }}
                    style={{
                      padding: "0.75rem 1.5rem",
                      backgroundColor: "#6c757d",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      transition: "all 0.2s ease",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = "#5a6268";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = "#6c757d";
                    }}
                  >
                    Back
                  </button>
                  {/* add content button */}
                  <button
                    onClick={handleContentSubmit}
                    disabled={
                      (selectedContentType === "notes" && !contentData.text) ||
                      (selectedContentType === "url" && !contentData.url) ||
                      (selectedContentType === "upload" && !contentData.file)
                    }
                    style={{
                      position: "sticky",
                      padding: "0.75rem 1.5rem",
                      backgroundColor:
                        contentTypes.find(
                          (ct) => ct.type === selectedContentType
                        )?.color || "#3498db",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      transition: "all 0.2s ease",
                      opacity:
                        (selectedContentType === "notes" &&
                          !contentData.text) ||
                        (selectedContentType === "url" && !contentData.url) ||
                        (selectedContentType === "upload" && !contentData.file)
                          ? "0.5"
                          : "1",
                    }}
                  >
                    Add Content
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Create Space Modal - only shown for root spaces */}
      {isCreateSpaceModalOpen &&
        !space.parent_space_id &&
        !space.is_child_space && (
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
            onClick={() => setIsCreateSpaceModalOpen(false)}
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
                Create New Subspace within {space.name}
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
                  onClick={() => setIsCreateSpaceModalOpen(false)}
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
                    backgroundColor: newSpaceName.trim()
                      ? "#4CAF50"
                      : "#bdc3c7",
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
export default SpaceView;
