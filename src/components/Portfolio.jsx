import React from "react";

const Portfolio = () => {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 70px)",
        padding: "2rem",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "4rem 2rem",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
          border: "1px solid #f1f3f4",
        }}
      >
        <div
          style={{
            fontSize: "4rem",
            marginBottom: "2rem",
          }}
        >
          💼
        </div>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "700",
            color: "#2c3e50",
            margin: "0 0 1rem 0",
          }}
        >
          My Portfolio
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: "#7f8c8d",
            margin: "0",
            maxWidth: "600px",
            marginLeft: "auto",
            marginRight: "auto",
            lineHeight: "1.6",
          }}
        >
          Showcase of my professional work, projects, and achievements. This
          section will display my latest projects, skills, and professional
          experience.
        </p>
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "12px",
            border: "2px dashed #e9ecef",
          }}
        >
          <p
            style={{
              margin: "0",
              color: "#6c757d",
              fontStyle: "italic",
            }}
          >
            Portfolio content coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
