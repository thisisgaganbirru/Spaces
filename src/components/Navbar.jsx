import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e1e8ed",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        width: "100%",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "70px",
        }}
      >
        {/* Logo */}
        <div
          onClick={() => handleNavigation("/")}
          style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            gap: "0.5rem",
          }}
        >
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#2c3e50",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            whoami
          </h1>
        </div>

        {/* Desktop Navigation */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <div
            style={{
              display: "none", // Hidden on mobile, shown on desktop via media query
              alignItems: "center",
              gap: "0.5rem",
            }}
            className="desktop-nav"
          >
            {[
              { path: "/portfolio", label: "Portfolio" },
              { path: "/spaces", label: "My Spaces" },
              { path: "/account", label: "Account" },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                style={{
                  padding: "0.75rem 1.25rem",
                  backgroundColor: isActive(item.path)
                    ? "#f8f9fa"
                    : "transparent",
                  color: isActive(item.path) ? "#3498db" : "#64748b",
                  border: isActive(item.path)
                    ? "1px solid #e1e8ed"
                    : "1px solid transparent",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  fontWeight: isActive(item.path) ? "600" : "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
                onMouseOver={(e) => {
                  if (!isActive(item.path)) {
                    e.target.style.backgroundColor = "#f1f5f9";
                    e.target.style.color = "#475569";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive(item.path)) {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = "#64748b";
                  }
                }}
              >
                <span style={{ fontSize: "1rem" }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            style={{
              display: "flex", // Always visible, hidden on desktop via media query
              alignItems: "center",
              justifyContent: "center",
              padding: "0.5rem",
              backgroundColor: "transparent",
              border: "1px solid #e1e8ed",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            className="mobile-menu-btn"
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#f1f5f9";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
          >
            <span style={{ fontSize: "1.25rem" }}>
              {isMobileMenuOpen ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div
          style={{
            backgroundColor: "#ffffff",
            borderTop: "1px solid #e1e8ed",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            padding: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              maxWidth: "1200px",
              margin: "0 auto",
            }}
          >
            {[
              {
                path: "/portfolio",
                label: "Portfolio",
                icon: "�",
                desc: "View my work",
              },
              {
                path: "/spaces",
                label: "My Spaces",
                icon: "�",
                desc: "Manage workspaces",
              },
              {
                path: "/account",
                label: "Account",
                icon: "�",
                desc: "Profile settings",
              },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                style={{
                  padding: "1rem",
                  backgroundColor: isActive(item.path)
                    ? "#f8f9fa"
                    : "transparent",
                  border: "1px solid #e1e8ed",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textAlign: "left",
                  width: "100%",
                }}
                onMouseOver={(e) => {
                  if (!isActive(item.path)) {
                    e.target.style.backgroundColor = "#f8f9fa";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive(item.path)) {
                    e.target.style.backgroundColor = "transparent";
                  }
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <span style={{ fontSize: "1.25rem" }}>{item.icon}</span>
                  <div>
                    <div
                      style={{
                        fontSize: "1rem",
                        fontWeight: "600",
                        color: isActive(item.path) ? "#3498db" : "#2c3e50",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: "#64748b",
                      }}
                    >
                      {item.desc}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
