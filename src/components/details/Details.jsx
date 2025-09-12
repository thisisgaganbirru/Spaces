import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../../services/userService";

const Details = ({ userData = {}, onUserDataUpdate }) => {
  const navigate = useNavigate();

  // State variables for each input field
  const [firstName, setFirstName] = useState(userData.firstName || "");
  const [lastName, setLastName] = useState(userData.lastName || "");
  const [professionalTitle, setProfessionalTitle] = useState(
    userData.professionalTitle || ""
  );
  const [email, setEmail] = useState(userData.email || "");
  const [phone, setPhone] = useState(userData.phone || "");
  const [location, setLocation] = useState(userData.location || "");
  const [linkedIn, setLinkedIn] = useState(userData.linkedIn || "");
  const [github, setGithub] = useState(userData.github || "");
  const [portfolio, setPortfolio] = useState(userData.portfolio || "");
  const [resumeUrl, setResumeUrl] = useState(userData.resumeUrl || "");
  const [resumeFile, setResumeFile] = useState(userData.resumeFile || null);

  // Event handlers to update the state when input values change
  const handleFirstNameChange = (event) => {
    setFirstName(event.target.value);
  };

  const handleLastNameChange = (event) => {
    setLastName(event.target.value);
  };

  const handleProfessionalTitleChange = (event) => {
    setProfessionalTitle(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePhoneChange = (event) => {
    setPhone(event.target.value);
  };

  const handleLocationChange = (event) => {
    setLocation(event.target.value);
  };

  const handleLinkedInChange = (event) => {
    setLinkedIn(event.target.value);
  };

  const handleGithubChange = (event) => {
    setGithub(event.target.value);
  };

  const handlePortfolioChange = (event) => {
    setPortfolio(event.target.value);
  };

  const handleResumeUrlChange = (event) => {
    setResumeUrl(event.target.value);
  };

  const handleResumeFileChange = (event) => {
    setResumeFile(event.target.files[0]);
  };

  const handleClearFields = () => {
    setFirstName("");
    setLastName("");
    setProfessionalTitle("");
    setEmail("");
    setPhone("");
    setLocation("");
    setLinkedIn("");
    setGithub("");
    setPortfolio("");
    setResumeUrl("");
    setResumeFile(null);
  };

  const handleSaveAndContinue = () => {
    // Create user data object with correct field names for userService
    const userDataObj = {
      firstName,
      lastName,
      professionalTitle,
      email,
      phone,
      location,
      linkedinUrl: linkedIn, // Convert linkedIn to linkedinUrl
      githubUrl: github, // Convert github to githubUrl
      portfolioUrl: portfolio, // Convert portfolio to portfolioUrl
      resumeUrl,
      resumeFile, // Keep for file handling (not stored in DB)
    };

    // Update parent component with user data
    if (onUserDataUpdate) {
      onUserDataUpdate(userDataObj);
    }

    console.log("Details saved:", userDataObj);

    // Navigate to CardStyles page
    navigate("/card-styles");
  };

  return (
    <div
      className="details-container"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        minHeight: "100vh",
        margin: "0",
        maxWidth: "none",
        padding: "0",
        borderRadius: "0",
        boxShadow: "none",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif",
      }}
    >
      {/* Left side - Image container */}
      <div
        className="image-container"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          position: "sticky",
          top: "0",
          height: "100vh",
        }}
      >
        <div
          style={{
            width: "200px",
            height: "200px",
            borderRadius: "20px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            marginBottom: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "4rem",
          }}
        >
          ⚡
        </div>
        <h1
          style={{
            fontSize: "3rem",
            textAlign: "center",
            marginBottom: "20px",
            fontWeight: "700",
            margin: "0 0 20px 0",
          }}
        >
          Create Your Professional Card
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            textAlign: "center",
            opacity: 0.9,
            lineHeight: "1.5",
            margin: "0",
          }}
        >
          Smart business cards with blockchain analytics
        </p>
      </div>

      {/* Right side - Form container */}
      <div
        style={{
          backgroundColor: "#0d1117",
          color: "#f0f6fc",
          padding: "40px",
          overflowY: "auto",
          minHeight: "100vh",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              fontSize: "32px",
              marginBottom: "8px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontWeight: "600",
            }}
          >
            ⚡
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#f0f6fc",
              margin: "0 0 8px 0",
            }}
          >
            Enter Your Professional Details
          </h1>
          <p
            style={{
              color: "#8b949e",
              fontSize: "16px",
              margin: "0",
            }}
          >
            Build your smart business card with blockchain analytics
          </p>
        </div>

        {/* Personal Information */}
        <div className="personal-info" style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#f0f6fc",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            👤 Personal Information
          </h2>

          <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
            <div style={{ flex: "1" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#f0f6fc",
                  marginBottom: "8px",
                }}
              >
                First name <span style={{ color: "#f85149" }}>*</span>
              </label>
              <input
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  color: "#f0f6fc",
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.15s ease",
                  boxSizing: "border-box",
                }}
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={handleFirstNameChange}
                onFocus={(e) => {
                  e.target.style.borderColor = "#1f6feb";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(31, 111, 235, 0.3)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#30363d";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            <div style={{ flex: "1" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#f0f6fc",
                  marginBottom: "8px",
                }}
              >
                Last name <span style={{ color: "#f85149" }}>*</span>
              </label>
              <input
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  color: "#f0f6fc",
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.15s ease",
                  boxSizing: "border-box",
                }}
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={handleLastNameChange}
                onFocus={(e) => {
                  e.target.style.borderColor = "#1f6feb";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(31, 111, 235, 0.3)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#30363d";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#f0f6fc",
                marginBottom: "8px",
              }}
            >
              Professional title
            </label>
            <input
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#0d1117",
                border: "1px solid #30363d",
                borderRadius: "6px",
                color: "#f0f6fc",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.15s ease",
                boxSizing: "border-box",
              }}
              type="text"
              placeholder="e.g. Software Engineer, Data Scientist"
              value={professionalTitle}
              onChange={handleProfessionalTitleChange}
              onFocus={(e) => {
                e.target.style.borderColor = "#1f6feb";
                e.target.style.boxShadow = "0 0 0 3px rgba(31, 111, 235, 0.3)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#30363d";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="contact-info" style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#f0f6fc",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            📞 Contact Information
          </h2>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#f0f6fc",
                marginBottom: "8px",
              }}
            >
              Email <span style={{ color: "#f85149" }}>*</span>
            </label>
            <input
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#0d1117",
                border: "1px solid #30363d",
                borderRadius: "6px",
                color: "#f0f6fc",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.15s ease",
                boxSizing: "border-box",
              }}
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={handleEmailChange}
              onFocus={(e) => {
                e.target.style.borderColor = "#1f6feb";
                e.target.style.boxShadow = "0 0 0 3px rgba(31, 111, 235, 0.3)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#30363d";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#f0f6fc",
                marginBottom: "8px",
              }}
            >
              Phone
            </label>
            <input
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#0d1117",
                border: "1px solid #30363d",
                borderRadius: "6px",
                color: "#f0f6fc",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.15s ease",
                boxSizing: "border-box",
              }}
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={handlePhoneChange}
              onFocus={(e) => {
                e.target.style.borderColor = "#1f6feb";
                e.target.style.boxShadow = "0 0 0 3px rgba(31, 111, 235, 0.3)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#30363d";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#f0f6fc",
                marginBottom: "8px",
              }}
            >
              Location
            </label>
            <input
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#0d1117",
                border: "1px solid #30363d",
                borderRadius: "6px",
                color: "#f0f6fc",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.15s ease",
                boxSizing: "border-box",
              }}
              type="text"
              placeholder="City, Country"
              value={location}
              onChange={handleLocationChange}
              onFocus={(e) => {
                e.target.style.borderColor = "#1f6feb";
                e.target.style.boxShadow = "0 0 0 3px rgba(31, 111, 235, 0.3)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#30363d";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="social-links" style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#f0f6fc",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🔗 Social Links
          </h2>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#f0f6fc",
                marginBottom: "8px",
              }}
            >
              LinkedIn Profile
            </label>
            <input
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#0d1117",
                border: "1px solid #30363d",
                borderRadius: "6px",
                color: "#f0f6fc",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.15s ease",
                boxSizing: "border-box",
              }}
              type="url"
              placeholder="https://linkedin.com/in/username"
              value={linkedIn}
              onChange={handleLinkedInChange}
              onFocus={(e) => {
                e.target.style.borderColor = "#1f6feb";
                e.target.style.boxShadow = "0 0 0 3px rgba(31, 111, 235, 0.3)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#30363d";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#f0f6fc",
                marginBottom: "8px",
              }}
            >
              GitHub Profile
            </label>
            <input
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#0d1117",
                border: "1px solid #30363d",
                borderRadius: "6px",
                color: "#f0f6fc",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.15s ease",
                boxSizing: "border-box",
              }}
              type="url"
              placeholder="https://github.com/username"
              value={github}
              onChange={handleGithubChange}
              onFocus={(e) => {
                e.target.style.borderColor = "#1f6feb";
                e.target.style.boxShadow = "0 0 0 3px rgba(31, 111, 235, 0.3)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#30363d";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#f0f6fc",
                marginBottom: "8px",
              }}
            >
              Portfolio Website
            </label>
            <input
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#0d1117",
                border: "1px solid #30363d",
                borderRadius: "6px",
                color: "#f0f6fc",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.15s ease",
                boxSizing: "border-box",
              }}
              type="url"
              placeholder="https://yourwebsite.com"
              value={portfolio}
              onChange={handlePortfolioChange}
              onFocus={(e) => {
                e.target.style.borderColor = "#1f6feb";
                e.target.style.boxShadow = "0 0 0 3px rgba(31, 111, 235, 0.3)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#30363d";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {/* Resume Upload */}
        <div className="resume-upload" style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#f0f6fc",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            📄 Resume <span style={{ color: "#f85149" }}>*</span>
          </h2>

          <div
            style={{
              padding: "16px",
              backgroundColor: "#0d1117",
              border: "1px solid #21262d",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            <p
              style={{
                color: "#8b949e",
                fontSize: "14px",
                margin: "0 0 12px 0",
                lineHeight: "1.5",
              }}
            >
              📈 This is where your QR code will point! Use Google Drive,
              Dropbox, or your personal website. Make sure the link allows
              public viewing. Every click will be tracked on the blockchain for
              analytics.
            </p>

            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#f0f6fc",
                marginBottom: "8px",
              }}
            >
              Resume URL
            </label>
            <input
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "6px",
                color: "#f0f6fc",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.15s ease",
                boxSizing: "border-box",
              }}
              type="url"
              placeholder="https://drive.google.com/file/d/..."
              value={resumeUrl}
              onChange={handleResumeUrlChange}
              onFocus={(e) => {
                e.target.style.borderColor = "#1f6feb";
                e.target.style.boxShadow = "0 0 0 3px rgba(31, 111, 235, 0.3)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#30363d";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ textAlign: "center", margin: "16px 0" }}>
            <span
              style={{
                color: "#8b949e",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              OR
            </span>
          </div>

          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#f0f6fc",
              marginBottom: "8px",
            }}
          >
            Upload Resume File
          </label>
          <div
            style={{
              position: "relative",
              border: "2px dashed #30363d",
              borderRadius: "8px",
              padding: "24px",
              textAlign: "center",
              backgroundColor: "#0d1117",
              transition: "all 0.15s ease",
              cursor: "pointer",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "#1f6feb";
              e.currentTarget.style.backgroundColor = "#161b22";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "#30363d";
              e.currentTarget.style.backgroundColor = "#0d1117";
            }}
          >
            <input
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                width: "100%",
                height: "100%",
                opacity: "0",
                cursor: "pointer",
              }}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeFileChange}
            />
            <div style={{ color: "#8b949e", fontSize: "14px" }}>
              <div style={{ marginBottom: "8px", fontSize: "24px" }}>📁</div>
              <div style={{ marginBottom: "4px", fontWeight: "600" }}>
                Click to upload or drag and drop
              </div>
              <div>PDF, DOC, or DOCX (max 10MB)</div>
            </div>
          </div>
          {resumeFile && (
            <p
              style={{
                color: "#238636",
                fontSize: "14px",
                marginTop: "8px",
                margin: "8px 0 0 0",
              }}
            >
              ✅ {resumeFile.name} selected
            </p>
          )}
        </div>

        {/* Buttons */}
        <div
          className="buttons"
          style={{
            display: "flex",
            gap: "12px",
            paddingTop: "24px",
            borderTop: "1px solid #21262d",
          }}
        >
          <button
            className="clear-button"
            onClick={handleClearFields}
            style={{
              flex: "1",
              padding: "12px 16px",
              backgroundColor: "#21262d",
              color: "#f0f6fc",
              border: "1px solid #30363d",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#30363d";
              e.target.style.borderColor = "#484f58";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#21262d";
              e.target.style.borderColor = "#30363d";
            }}
          >
            Clear fields
          </button>
          <button
            className="save-button"
            onClick={handleSaveAndContinue}
            style={{
              flex: "2",
              padding: "12px 16px",
              backgroundColor: "#238636",
              color: "#ffffff",
              border: "1px solid #238636",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#2ea043";
              e.target.style.borderColor = "#2ea043";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#238636";
              e.target.style.borderColor = "#238636";
            }}
          >
            Create Professional Card →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Details;
