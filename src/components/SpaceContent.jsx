import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { spaceService } from "../services/spaceService";
import {
  FileText,
  ExternalLink,
  Code2,
  Image,
  Play,
  File,
  Eye,
  Trash2,
} from "lucide-react";

// Content display component for a Space
// Props:
// - space: the current space object (expects space.space_id, name, color, etc.)
// - spaceContent: optional initial array of content items from API (space_content rows)
const SpaceContent = ({ space: propSpace, spaceContent = [] }) => {
  const { spaceId, parentSlug, childSlug } = useParams();
  const navigate = useNavigate();

  const [space, setSpace] = useState(propSpace || null);
  const [loading, setLoading] = useState(!propSpace);
  const [contentItems, setContentItems] = useState(spaceContent || []);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteContent, setDeleteContent] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync props
  useEffect(() => {
    if (propSpace) {
      setSpace(propSpace);
      setLoading(false);
    }
  }, [propSpace]);

  useEffect(() => {
    if (Array.isArray(spaceContent)) setContentItems(spaceContent);
  }, [spaceContent]);

  // Minimal fallback: load space from sessionStorage and then load content from API
  useEffect(() => {
    if (propSpace) return;
    const load = async () => {
      try {
        setLoading(true);
        const slug = childSlug || spaceId;
        const cacheKey =
          childSlug && parentSlug
            ? `space_${parentSlug}_${childSlug}`
            : `space_${slug}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const cachedSpace = JSON.parse(cached);
          setSpace(cachedSpace);
          // load content
          try {
            const apiContent = await spaceService.getSpaceContent(
              cachedSpace.space_id
            );
            setContentItems(apiContent);
          } catch {
            setContentItems([]);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [propSpace, spaceId, parentSlug, childSlug]);

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getContentIcon = (content) => {
    if (!content) return <File size={20} color="#6b7280" />;
    if (content.type === "notes") return <FileText size={20} color="#3b82f6" />;
    if (content.type === "url")
      return <ExternalLink size={20} color="#22c55e" />;
    if (content.type === "upload") {
      const ext = (content.data?.fileExtension || "").toLowerCase();
      if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(`.${ext}`))
        return <Image size={20} color="#a855f7" />;
      if ([".mp4", ".mov", ".avi", ".webm", ".mkv"].includes(`.${ext}`))
        return <Play size={20} color="#ef4444" />;
      if ([".js", ".jsx", ".ts", ".tsx", ".html", ".css"].includes(`.${ext}`))
        return <Code2 size={20} color="#eab308" />;
      return <File size={20} color="#6b7280" />;
    }
    return <File size={20} color="#6b7280" />;
  };

  const getContentTitle = (content) => {
    if (!content) return "Content Item";
    switch (content.type) {
      case "notes": {
        const text = content.data?.text || "";
        const head = text.substring(0, 50);
        return head + (text.length > 50 ? "..." : "") || "Untitled Note";
      }
      case "url":
        return content.data?.domain || content.data?.url || "Link";
      case "upload":
        return content.data?.fileName || "Uploaded File";
      default:
        return "Content Item";
    }
  };

  const getContentTypeBadge = (content) => {
    const typeConfigs = {
      notes: {
        label: "Note",
        color: "#3b82f6",
        bg: "#eff6ff",
        border: "#dbeafe",
      },
      url: {
        label: "Link",
        color: "#22c55e",
        bg: "#f0fdf4",
        border: "#dcfce7",
      },
      upload: {
        label: "File",
        color: "#a855f7",
        bg: "#faf5ff",
        border: "#f3e8ff",
      },
    };

    const config = typeConfigs[content.type] || typeConfigs.upload;

    return (
      <span
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: config.color,
          background: config.bg,
          border: `1px solid ${config.border}`,
          padding: "2px 8px",
          borderRadius: "12px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
        }}
      >
        {config.label}
      </span>
    );
  };

  const getContentDescription = (content) => {
    if (!content) return "";
    switch (content.type) {
      case "notes":
        return `${content.data?.wordCount || 0} words • ${
          content.data?.characterCount || 0
        } characters`;
      case "url":
        return content.data?.url || "External link";
      case "upload":
        return `${
          content.data?.fileSizeFormatted ||
          formatFileSize(content.data?.fileSize) ||
          "Unknown size"
        } • ${content.data?.fileType || "Unknown type"}`;
      default:
        return "Content item";
    }
  };

  const getContentDateLabel = (content) => {
    if (!content.created_at) return "Recently added";

    const date = new Date(content.created_at).toLocaleDateString();

    switch (content.type) {
      case "upload":
        return `Uploaded on ${date}`;
      case "notes":
        return `Created on ${date}`;
      case "url":
        return `Added on ${date}`;
      default:
        return `Added on ${date}`;
    }
  };

  // Handle opening preview - load full data for upload content
  const handleOpenPreview = async (content) => {
    try {
      if (content.type === "upload") {
        // Load full content data including file data
        const fullContent = await spaceService.getFullContentData(
          space.space_id,
          content.content_id
        );
        setPreviewContent(fullContent);
      } else {
        // For notes and URLs, use the existing data
        setPreviewContent(content);
      }
      setIsPreviewOpen(true);
    } catch (error) {
      console.error("Error loading full content data:", error);
      // Fall back to showing the content without full data
      setPreviewContent(content);
      setIsPreviewOpen(true);
    }
  };

  const handleDeleteClick = (content) => {
    setDeleteContent(content);
    setIsDeleteModalOpen(true);
  };

  const handleSoftDelete = async () => {
    if (!deleteContent || !space) return;

    setIsDeleting(true);
    try {
      await spaceService.deleteContent(
        space.space_id,
        deleteContent.content_id
      );

      // Remove from frontend state
      setContentItems((prev) =>
        prev.filter((item) => item.content_id !== deleteContent.content_id)
      );

      setIsDeleteModalOpen(false);
      setDeleteContent(null);
    } catch (error) {
      console.error("Error deleting content:", error);
      alert("Failed to delete content. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteContent || !space) return;

    setIsDeleting(true);
    try {
      await spaceService.deleteContentPermanently(
        space.space_id,
        deleteContent.content_id
      );

      // Remove from frontend state
      setContentItems((prev) =>
        prev.filter((item) => item.content_id !== deleteContent.content_id)
      );

      setIsDeleteModalOpen(false);
      setDeleteContent(null);
    } catch (error) {
      console.error("Error permanently deleting content:", error);
      alert("Failed to permanently delete content. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "#4b5563" }}>Loading space...</div>
      </div>
    );
  }

  if (!space) {
    return (
      <div
        style={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#374151", fontWeight: 600, marginBottom: 8 }}>
            Space not found
          </div>
          <button
            onClick={() => navigate("/spaces")}
            style={{
              background: "#3b82f6",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: 8,
              border: 0,
              cursor: "pointer",
            }}
          >
            Back to Spaces
          </button>
        </div>
      </div>
    );
  }

  // Content display component for a Space
  return (
    <div style={{ padding: "24px", overflowY: "auto", width: "100%" }}>
      <div style={{ maxWidth: 960 }}>
        {/* Content List */}
        <h3
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "#1f2937",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
          }}
        >
          Content in this Space
          <span
            style={{
              marginLeft: "8px",
              fontSize: "14px",
              fontWeight: 400,
              color: "#6b7280",
            }}
          >
            ({contentItems?.length || 0} items)
          </span>
        </h3>

        {contentItems && contentItems.length > 0 ? (
          contentItems.map((content, idx) => (
            <div
              key={content.content_id || idx}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "12px",
                cursor: "pointer",
                transition:
                  "background-color 0.2s ease-in-out, border-color 0.2s ease-in-out",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(59, 130, 246, 0.05)";
                e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#fff";
                e.currentTarget.style.borderColor = "#e5e7eb";
              }}
              onClick={() => {
                if (content.type === "url" && content.data?.url) {
                  window.open(content.data.url, "_blank");
                } else {
                  handleOpenPreview(content);
                }
              }}
            >
              <div style={{ display: "flex", gap: "12px" }}>
                {/* Left side: Icon */}
                <div style={{ flexShrink: 0 }}>{getContentIcon(content)}</div>

                {/* Right side: Badge and Content Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Badge at top */}
                  <div style={{ marginBottom: "8px" }}>
                    {getContentTypeBadge(content)}
                  </div>

                  {/* Content Details starting under badge */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1, marginRight: "12px" }}>
                      <h4
                        style={{
                          fontWeight: 600,
                          color: "#1f2937",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          margin: 0,
                          marginBottom: "4px",
                        }}
                      >
                        {getContentTitle(content)}
                      </h4>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "#6b7280",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          margin: 0,
                          marginBottom: "4px",
                        }}
                      >
                        {getContentDescription(content)}
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#9ca3af",
                          margin: 0,
                        }}
                      >
                        {getContentDateLabel(content)}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div
                      style={{ display: "flex", gap: "8px", flexShrink: 0 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          fontSize: "14px",
                          background: "#f3f4f6",
                          color: "#374151",
                          border: 0,
                          borderRadius: "8px",
                          cursor: "pointer",
                          transition: "all 0.15s ease-in-out",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#e5e7eb";
                          e.target.style.color = "#1f2937";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "#f3f4f6";
                          e.target.style.color = "#374151";
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (content.type === "url" && content.data?.url) {
                            window.open(content.data.url, "_blank");
                          } else {
                            handleOpenPreview(content);
                          }
                        }}
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          fontSize: "14px",
                          background: "#fee2e2",
                          color: "#dc2626",
                          border: 0,
                          borderRadius: "8px",
                          cursor: "pointer",
                          transition: "all 0.15s ease-in-out",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#fecaca";
                          e.target.style.color = "#b91c1c";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "#fee2e2";
                          e.target.style.color = "#dc2626";
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(content);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          // No content message
          <div
            style={{
              textAlign: "center",
              padding: "48px",
              background: "#fff",
              border: "2px dashed #d1d5db",
              borderRadius: "12px",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>📝</div>
            <div
              style={{ color: "#1f2937", fontWeight: 600, marginBottom: "4px" }}
            >
              No content yet
            </div>
            <div style={{ color: "#6b7280" }}>
              Start by adding some content to this space using the options
              above.
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && previewContent && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "10px",
              maxWidth: "720px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ padding: "24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "24px",
                }}
              >
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#1f2937",
                  }}
                >
                  Preview
                </h2>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <button
                    onClick={() => {
                      setDeleteContent(previewContent);
                      setIsDeleteModalOpen(true);
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 12px",
                      fontSize: "14px",
                      background: "#fee2e2",
                      color: "#dc2626",
                      border: 0,
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.15s ease-in-out",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#fecaca";
                      e.target.style.color = "#b91c1c";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#fee2e2";
                      e.target.style.color = "#dc2626";
                    }}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    style={{
                      background: "none",
                      border: 0,
                      color: "#6b7280",
                      cursor: "pointer",
                      fontSize: "18px",
                      padding: "8px",
                      borderRadius: "4px",
                      transition: "background-color 0.15s ease-in-out",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#f3f4f6";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent";
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div>
                {/* Notes Preview */}
                {previewContent.type === "notes" && (
                  <div>
                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "16px",
                        marginBottom: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "8px",
                        }}
                      >
                        <FileText size={20} color="#3b82f6" />
                        <span style={{ fontWeight: 600, color: "#1f2937" }}>
                          Note Content
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        {previewContent.data?.wordCount || 0} words •{" "}
                        {previewContent.data?.characterCount || 0} characters
                      </div>
                    </div>
                    <div
                      style={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "16px",
                        maxHeight: "400px",
                        overflowY: "auto",
                      }}
                    >
                      <pre
                        style={{
                          whiteSpace: "pre-wrap",
                          fontSize: "14px",
                          color: "#1f2937",
                          margin: 0,
                          fontFamily: "inherit",
                          lineHeight: "1.5",
                        }}
                      >
                        {previewContent.data?.text || "(empty note)"}
                      </pre>
                    </div>
                  </div>
                )}

                {/* URL Preview */}
                {previewContent.type === "url" && (
                  <div>
                    <div
                      style={{
                        background: "#f0fdf4",
                        border: "1px solid #dcfce7",
                        borderRadius: "8px",
                        padding: "16px",
                        marginBottom: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "8px",
                        }}
                      >
                        <ExternalLink size={20} color="#22c55e" />
                        <span style={{ fontWeight: 600, color: "#1f2937" }}>
                          Link Preview
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        External website link
                      </div>
                    </div>
                    <div
                      style={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "16px",
                      }}
                    >
                      <div style={{ marginBottom: "12px" }}>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#1f2937",
                            marginBottom: "4px",
                          }}
                        >
                          URL:
                        </div>
                        <a
                          href={previewContent.data?.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#2563eb",
                            textDecoration: "none",
                            fontSize: "14px",
                            wordBreak: "break-all",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.textDecoration = "underline";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.textDecoration = "none";
                          }}
                        >
                          {previewContent.data?.url}
                        </a>
                      </div>
                      {previewContent.data?.domain && (
                        <div style={{ marginBottom: "12px" }}>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "#1f2937",
                              marginBottom: "4px",
                            }}
                          >
                            Domain:
                          </div>
                          <div style={{ fontSize: "14px", color: "#6b7280" }}>
                            {previewContent.data.domain}
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() =>
                          window.open(previewContent.data?.url, "_blank")
                        }
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 16px",
                          background: "#22c55e",
                          color: "#fff",
                          border: 0,
                          borderRadius: "6px",
                          fontSize: "14px",
                          fontWeight: 500,
                          cursor: "pointer",
                          transition: "background-color 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#16a34a";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "#22c55e";
                        }}
                      >
                        <ExternalLink size={16} />
                        Open Link
                      </button>
                    </div>
                  </div>
                )}

                {/* File Upload Preview */}
                {previewContent.type === "upload" && (
                  <div>
                    <div
                      style={{
                        background: "#faf5ff",
                        border: "1px solid #f3e8ff",
                        borderRadius: "8px",
                        padding: "16px",
                        marginBottom: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "8px",
                        }}
                      >
                        {getContentIcon(previewContent)}
                        <span style={{ fontWeight: 600, color: "#1f2937" }}>
                          {previewContent.data?.fileName || "Uploaded File"}
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        {previewContent.data?.fileSizeFormatted ||
                          formatFileSize(previewContent.data?.fileSize) ||
                          "Unknown size"}{" "}
                        • {previewContent.data?.fileType || "Unknown type"}
                      </div>
                    </div>

                    {/* File Content Display */}
                    <div
                      style={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "16px",
                        marginBottom: "16px",
                      }}
                    >
                      {(() => {
                        const fileExtension = (
                          previewContent.data?.fileExtension || ""
                        ).toLowerCase();
                        const fileData = previewContent.data?.fileData;

                        if (!fileData) {
                          return (
                            <div
                              style={{
                                textAlign: "center",
                                color: "#6b7280",
                                padding: "20px",
                              }}
                            >
                              <File size={32} style={{ marginBottom: "8px" }} />
                              <div>File content not available for preview</div>
                            </div>
                          );
                        }

                        // Image files
                        if (
                          [
                            ".jpg",
                            ".jpeg",
                            ".png",
                            ".gif",
                            ".webp",
                            ".svg",
                            ".bmp",
                          ].includes(`.${fileExtension}`)
                        ) {
                          return (
                            <div style={{ textAlign: "center" }}>
                              <div
                                style={{
                                  marginBottom: "12px",
                                  fontWeight: "600",
                                  color: "#1f2937",
                                }}
                              >
                                Image Preview:
                              </div>
                              <img
                                src={fileData}
                                alt={previewContent.data?.fileName}
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "400px",
                                  borderRadius: "8px",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                }}
                              />
                            </div>
                          );
                        }

                        // Text-based files
                        if (
                          [
                            ".txt",
                            ".md",
                            ".json",
                            ".html",
                            ".css",
                            ".js",
                            ".jsx",
                            ".ts",
                            ".tsx",
                            ".py",
                            ".java",
                            ".cpp",
                            ".c",
                            ".cs",
                            ".go",
                            ".rb",
                            ".php",
                            ".xml",
                            ".yaml",
                            ".yml",
                            ".sql",
                          ].includes(`.${fileExtension}`)
                        ) {
                          // Extract text content from data URL
                          try {
                            const base64Data = fileData.split(",")[1];
                            const textContent = atob(base64Data);
                            return (
                              <div>
                                <div
                                  style={{
                                    marginBottom: "12px",
                                    fontWeight: "600",
                                    color: "#1f2937",
                                  }}
                                >
                                  File Content:
                                </div>
                                <div
                                  style={{
                                    background: "#f8f9fa",
                                    border: "1px solid #e9ecef",
                                    borderRadius: "6px",
                                    padding: "16px",
                                    maxHeight: "400px",
                                    overflowY: "auto",
                                    fontFamily:
                                      "Monaco, 'Lucida Console', monospace",
                                    fontSize: "13px",
                                    lineHeight: "1.5",
                                  }}
                                >
                                  <pre
                                    style={{
                                      margin: 0,
                                      whiteSpace: "pre-wrap",
                                      wordWrap: "break-word",
                                    }}
                                  >
                                    {textContent}
                                  </pre>
                                </div>
                              </div>
                            );
                          } catch (error) {
                            return (
                              <div
                                style={{
                                  textAlign: "center",
                                  color: "#ef4444",
                                  padding: "20px",
                                }}
                              >
                                <div>Error reading file content</div>
                              </div>
                            );
                          }
                        }

                        // PDF files
                        if (fileExtension === "pdf") {
                          return (
                            <div>
                              <div
                                style={{
                                  marginBottom: "12px",
                                  fontWeight: "600",
                                  color: "#1f2937",
                                }}
                              >
                                PDF Preview:
                              </div>
                              <iframe
                                src={fileData}
                                style={{
                                  width: "100%",
                                  height: "400px",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "6px",
                                }}
                                title="PDF Preview"
                              />
                            </div>
                          );
                        }

                        // Video files
                        if (
                          [".mp4", ".mov", ".avi", ".webm", ".mkv"].includes(
                            `.${fileExtension}`
                          )
                        ) {
                          return (
                            <div>
                              <div
                                style={{
                                  marginBottom: "12px",
                                  fontWeight: "600",
                                  color: "#1f2937",
                                }}
                              >
                                Video Preview:
                              </div>
                              <video
                                controls
                                style={{
                                  width: "100%",
                                  maxHeight: "400px",
                                  borderRadius: "6px",
                                }}
                              >
                                <source
                                  src={fileData}
                                  type={previewContent.data?.fileType}
                                />
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          );
                        }

                        // Audio files
                        if (
                          [".mp3", ".aac", ".m4a", ".wav", ".ogg"].includes(
                            `.${fileExtension}`
                          )
                        ) {
                          return (
                            <div>
                              <div
                                style={{
                                  marginBottom: "12px",
                                  fontWeight: "600",
                                  color: "#1f2937",
                                }}
                              >
                                Audio Preview:
                              </div>
                              <audio
                                controls
                                style={{
                                  width: "100%",
                                }}
                              >
                                <source
                                  src={fileData}
                                  type={previewContent.data?.fileType}
                                />
                                Your browser does not support the audio tag.
                              </audio>
                            </div>
                          );
                        }

                        // Default fallback for other file types
                        return (
                          <div
                            style={{
                              textAlign: "center",
                              color: "#6b7280",
                              padding: "20px",
                            }}
                          >
                            <File size={32} style={{ marginBottom: "8px" }} />
                            <div
                              style={{ fontWeight: "600", marginBottom: "4px" }}
                            >
                              Preview not available for this file type
                            </div>
                            <div style={{ fontSize: "14px" }}>
                              {previewContent.data?.fileName} •{" "}
                              {previewContent.data?.fileType}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Download Button */}
                    {previewContent.data?.fileData && (
                      <div style={{ textAlign: "center" }}>
                        <button
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = previewContent.data.fileData;
                            link.download =
                              previewContent.data.fileName || "download";
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 16px",
                            background: "#a855f7",
                            color: "#fff",
                            border: 0,
                            borderRadius: "6px",
                            fontSize: "14px",
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "background-color 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#9333ea";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#a855f7";
                          }}
                        >
                          <File size={16} />
                          Download File
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Fallback for unknown content types */}
                {!["notes", "url", "upload"].includes(previewContent.type) && (
                  <div
                    style={{
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "24px",
                      textAlign: "center",
                    }}
                  >
                    <File
                      size={32}
                      color="#6b7280"
                      style={{ marginBottom: "8px" }}
                    />
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#1f2937",
                        marginBottom: "4px",
                      }}
                    >
                      Content Preview Unavailable
                    </div>
                    <div style={{ fontSize: "14px", color: "#6b7280" }}>
                      This content type cannot be previewed
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deleteContent && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              maxWidth: "500px",
              width: "100%",
              padding: "24px",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  display: "inline-flex",
                  width: "100%",
                  alignItems: "center",
                  marginBottom: "5px",
                  gap: "50px",
                  padding: "15px",
                  fontSize: "14px",
                  background: "#fee2e2",
                  color: "#dc2626",
                  border: 0,
                }}
              >
                <Trash2 size={20} />

                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#1f2937",
                    marginBottom: "8px",
                  }}
                >
                  Are you sure you want to delete?
                </h2>
              </div>
              <p style={{ color: "#6b7280", margin: 0, marginBottom: "16px" }}>
                "{getContentTitle(deleteContent)}"
              </p>

              {/* Information Note */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#475569",
                    lineHeight: "1.5",
                  }}
                >
                  <div style={{ marginBottom: "8px" }}>
                    <strong>• Trash:</strong> Content will be moved to trash for
                    30 days before being permanently deleted.
                  </div>
                  <div>
                    <strong>• Delete:</strong> Content will be permanently
                    deleted and cannot be recovered.
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteContent(null);
                }}
                disabled={isDeleting}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  color: "#374151",
                  borderRadius: "8px",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  opacity: isDeleting ? 0.6 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSoftDelete}
                disabled={isDeleting}
                style={{
                  padding: "8px 16px",
                  border: 0,
                  background: "#f59e0b",
                  color: "#fff",
                  borderRadius: "8px",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  opacity: isDeleting ? 0.6 : 1,
                }}
              >
                {isDeleting ? "Moving..." : "Move to Trash"}
              </button>
              <button
                onClick={handlePermanentDelete}
                disabled={isDeleting}
                style={{
                  padding: "8px 16px",
                  border: 0,
                  background: "#dc2626",
                  color: "#fff",
                  borderRadius: "8px",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  opacity: isDeleting ? 0.6 : 1,
                }}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpaceContent;
