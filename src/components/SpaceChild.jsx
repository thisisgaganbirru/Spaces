import React from "react";
import { useNavigate } from "react-router-dom";
import { spaceService } from "../services/spaceService";
import { Star } from "lucide-react";

const SpaceChild = ({ space, childSpaces = [], onAddSubspace }) => {
  const navigate = useNavigate();

  const formatUpdated = (space) => {
    const createdAt = space?.created_at;
    const updatedAt = space?.updated_at;

    if (!createdAt && !updatedAt) return "No date info";

    try {
      const now = new Date();
      const options = { month: "short", day: "numeric" };

      // Format created date
      let createdText = "";
      if (createdAt) {
        const createdDate = new Date(createdAt);
        const diffDays = Math.floor(
          (now - createdDate) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 0) {
          createdText = "Created today";
        } else {
          createdText = `Created ${createdDate.toLocaleDateString(
            undefined,
            options
          )}`;
        }
      }

      // Format updated date
      let updatedText = "";
      if (updatedAt && updatedAt !== createdAt) {
        const updatedDate = new Date(updatedAt);
        const diffDays = Math.floor(
          (now - updatedDate) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 0) {
          updatedText = "Updated today";
        } else {
          updatedText = `Updated ${updatedDate.toLocaleDateString(
            undefined,
            options
          )}`;
        }
      }

      // Combine both dates
      if (createdText && updatedText) {
        return `${createdText} • ${updatedText}`;
      } else if (updatedText) {
        return updatedText;
      } else {
        return createdText;
      }
    } catch {
      return "Date unavailable";
    }
  };

  const getIconLetter = (name = "?") =>
    name.trim().charAt(0).toUpperCase() || "?";

  const pickColor = (seed) => {
    const palette = [
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#14B8A6",
    ];
    let hash = 0;
    for (let i = 0; i < (seed || "").length; i++)
      hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    return palette[hash % palette.length];
  };

  const goToSubspace = (subspace) => {
    if (!space || !subspace) return;
    const parentSlug = spaceService.generateSlug(space.name);
    const childSlug = spaceService.generateSlug(subspace.name);
    const nestedPath = `/spaces/${parentSlug}/${childSlug}`;
    sessionStorage.setItem(
      `space_${parentSlug}_${childSlug}`,
      JSON.stringify(subspace)
    );
    navigate(nestedPath);
  };

  return (
    <aside
      style={{
        background: "#0B1220",
        border: "1px solid #1E293B",
        borderRadius: "12px",
        padding: "1rem",
        marginTop: "4rem",
        color: "#E5E7EB",
      }}
    >
      {/* Sub Space Block Header */}
      <div style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: "700",
            color: "#E5E7EB",
            margin: "0",
          }}
        >
          Sub Space Blocks
          <span
            style={{
              marginLeft: "8px",
              fontSize: "14px",
              fontWeight: 700,
              color: "#6b7280",
            }}
          >
            ({childSpaces?.length || 0} items)
          </span>
        </h3>
        <div
          style={{
            fontSize: "0.75rem",
            color: "#94A3B8",
            marginTop: "0.25rem",
          }}
        >
          Tools & quick stats
        </div>
      </div>

      {/* Child Spaces List */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          marginTop: "0.75rem",
        }}
      >
        {childSpaces && childSpaces.length > 0 ? (
          childSpaces.map((subspace) => (
            <div
              key={subspace.space_id || subspace.id}
              style={{
                background: "#0F172A",
                border: "1px solid #1F2937",
                borderRadius: "12px",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onClick={() => goToSubspace(subspace)}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.35)";
                e.currentTarget.style.background = "#0B1530";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.background = "#0F172A";
              }}
            >
              {/* Card Content Row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    minWidth: "0",
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: pickColor(subspace.name),
                      color: "white",
                      fontWeight: "700",
                    }}
                  >
                    {getIconLetter(subspace.name)}
                  </div>
                  {/* Title and Description */}
                  <div style={{ minWidth: "0" }}>
                    <div
                      style={{
                        color: "#E5E7EB",
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {subspace.name}
                    </div>
                    <div
                      style={{
                        color: "#94A3B8",
                        fontSize: "0.75rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {subspace.description || "Subspace"}
                    </div>
                  </div>
                </div>
                {/* Star Icon */}
                <Star size={18} color="#FBBF24" />
              </div>
              {/* Date Info - Created and Last Updated */}
              <div style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                {formatUpdated(subspace)}
              </div>
            </div>
          ))
        ) : (
          <div style={{ color: "#94A3B8", fontSize: "0.875rem" }}>
            No subspaces yet
          </div>
        )}
      </div>

      {/* Add Subspace Button */}
      {onAddSubspace && (
        <button
          style={{
            marginTop: "0.75rem",
            width: "100%",
            background: "#1D4ED8",
            border: "none",
            color: "white",
            padding: "0.625rem 0.75rem",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            transition: "all 0.2s ease",
          }}
          onClick={onAddSubspace}
          onMouseOver={(e) => {
            e.target.style.background = "#1E40AF";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "#1D4ED8";
            e.target.style.transform = "translateY(0)";
          }}
        >
          + Add Subspace
        </button>
      )}
    </aside>
  );
};

export default SpaceChild;
