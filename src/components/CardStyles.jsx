import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cardService } from "../services/cardService";
import { userService } from "../services/userService";

const CardStyles = ({ userData, onGenerate }) => {
  const navigate = useNavigate();
  const [selectedDesign, setSelectedDesign] = useState("modern");
  const [isGenerating, setIsGenerating] = useState(false);
  const [cardStyles, setCardStyles] = useState([]);

  // Load card styles from database
  useEffect(() => {
    const loadCardStyles = async () => {
      try {
        const styles = await cardService.getAllCardStyles();
        setCardStyles(styles);
      } catch (error) {
        console.error("Error loading card styles:", error);
      }
    };

    loadCardStyles();
  }, []);

  // Function to save card to backend
  const saveCardToBackend = async (cardData) => {
    try {
      // Get or create user
      let user = userData;
      if (!user?.id) {
        if (user?.email) {
          user = await userService.getUserByEmail(user.email);
        }
        if (!user) {
          user = await userService.createUser(userData);
        }
      }

      // Get card style
      const cardStyle = await cardService.getCardStyleByName(selectedDesign);
      if (!cardStyle) {
        throw new Error("Card style not found");
      }

      // Generate card
      const savedCard = await cardService.generateCard({
        userId: user.id,
        cardStyleId: cardStyle.id,
        cardData: cardData,
      });

      return {
        cardId: savedCard.card_id,
        data: savedCard,
      };
    } catch (error) {
      console.error("Error saving card:", error);
      throw error;
    }
  };

  // User Data Display Component
  const UserDataDisplay = () => {
    return (
      <div
        style={{
          backgroundColor: "#161b22",
          border: "1px solid #30363d",
          borderRadius: "8px",
          padding: "24px",
          marginBottom: "32px",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#f0f6fc",
            margin: "0 0 16px 0",
          }}
        >
          Your Information
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "16px",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          <div>
            <strong style={{ color: "#f0f6fc" }}>Name:</strong>
            <div style={{ color: "#8b949e", marginTop: "4px" }}>
              {userData?.firstName && userData?.lastName
                ? `${userData.firstName} ${userData.lastName}`
                : "Not provided"}
            </div>
          </div>
          <div>
            <strong style={{ color: "#f0f6fc" }}>Professional Title:</strong>
            <div style={{ color: "#8b949e", marginTop: "4px" }}>
              {userData?.professionalTitle || "Not provided"}
            </div>
          </div>
          <div>
            <strong style={{ color: "#f0f6fc" }}>Email:</strong>
            <div style={{ color: "#8b949e", marginTop: "4px" }}>
              {userData?.email || "Not provided"}
            </div>
          </div>
          <div>
            <strong style={{ color: "#f0f6fc" }}>Phone:</strong>
            <div style={{ color: "#8b949e", marginTop: "4px" }}>
              {userData?.phone || "Not provided"}
            </div>
          </div>
          <div>
            <strong style={{ color: "#f0f6fc" }}>Location:</strong>
            <div style={{ color: "#8b949e", marginTop: "4px" }}>
              {userData?.location || "Not provided"}
            </div>
          </div>
          <div>
            <strong style={{ color: "#f0f6fc" }}>LinkedIn:</strong>
            <div style={{ color: "#8b949e", marginTop: "4px" }}>
              {userData?.linkedIn || "Not provided"}
            </div>
          </div>
          <div>
            <strong style={{ color: "#f0f6fc" }}>GitHub:</strong>
            <div style={{ color: "#8b949e", marginTop: "4px" }}>
              {userData?.github || "Not provided"}
            </div>
          </div>
          <div>
            <strong style={{ color: "#f0f6fc" }}>Portfolio:</strong>
            <div style={{ color: "#8b949e", marginTop: "4px" }}>
              {userData?.portfolio || "Not provided"}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Card Preview Component
  const CardPreview = ({ design, title, description, isSelected }) => {
    const getCardStyle = () => {
      const baseStyle = {
        maxWidth: "320px",
        margin: "0 auto",
        padding: "20px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        border: isSelected ? "3px solid #1f6feb" : "2px solid transparent",
        borderRadius: "12px",
        transform: isSelected ? "scale(1.02)" : "scale(1)",
        boxShadow: isSelected
          ? "0 12px 32px rgba(31, 111, 235, 0.4)"
          : "0 6px 16px rgba(0, 0, 0, 0.3)",
      };

      switch (design) {
        case "modern":
          return {
            ...baseStyle,
            backgroundColor: "#161b22",
            color: "#f0f6fc",
          };
        case "gradient":
          return {
            ...baseStyle,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#ffffff",
          };
        case "minimal":
          return {
            ...baseStyle,
            backgroundColor: "#ffffff",
            color: "#2d3748",
            border: isSelected ? "3px solid #1f6feb" : "2px solid #e2e8f0",
          };
        default:
          return baseStyle;
      }
    };

    const getTextColor = () => {
      switch (design) {
        case "gradient":
          return "#e0e7ff";
        case "minimal":
          return "#718096";
        default:
          return "#8b949e";
      }
    };

    return (
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#f0f6fc",
            margin: "0 0 8px 0",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: "14px",
            color: "#8b949e",
            margin: "0 0 16px 0",
          }}
        >
          {description}
        </p>
        <div style={getCardStyle()} onClick={() => handleDesignSelect(design)}>
          <h4
            style={{
              margin: "0 0 8px 0",
              fontSize: "18px",
              fontWeight: "600",
              color: design === "minimal" ? "#2d3748" : "#f0f6fc",
            }}
          >
            {userData?.firstName && userData?.lastName
              ? `${userData.firstName} ${userData.lastName}`
              : "Your Name"}
          </h4>
          <p
            style={{
              margin: "0 0 16px 0",
              fontSize: "14px",
              color: getTextColor(),
            }}
          >
            {userData?.professionalTitle || "Your Professional Title"}
          </p>
          <div
            style={{ fontSize: "12px", lineHeight: "1.6", textAlign: "left" }}
          >
            {userData?.email && (
              <div style={{ marginBottom: "4px" }}>📧 {userData.email}</div>
            )}
            {userData?.phone && (
              <div style={{ marginBottom: "4px" }}>📱 {userData.phone}</div>
            )}
            {userData?.location && (
              <div style={{ marginBottom: "4px" }}>📍 {userData.location}</div>
            )}
            {userData?.linkedIn && (
              <div style={{ marginBottom: "4px" }}>🔗 LinkedIn</div>
            )}
            {userData?.github && (
              <div style={{ marginBottom: "4px" }}>💻 GitHub</div>
            )}
            {userData?.portfolio && (
              <div style={{ marginBottom: "4px" }}>🌐 Portfolio</div>
            )}
            {!userData?.email && !userData?.phone && !userData?.location && (
              <div
                style={{
                  color: getTextColor(),
                  fontStyle: "italic",
                  textAlign: "center",
                }}
              >
                Your contact info will appear here
              </div>
            )}
          </div>
          {isSelected && (
            <div
              style={{
                marginTop: "12px",
                padding: "6px 12px",
                backgroundColor: "rgba(31, 111, 235, 0.1)",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#1f6feb",
                textAlign: "center",
              }}
            >
              ✓ Selected
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0d1117",
        color: "#f0f6fc",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              fontSize: "48px",
              marginBottom: "16px",
            }}
          >
            🎨
          </div>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: "700",
              color: "#f0f6fc",
              margin: "0 0 12px 0",
            }}
          >
            Choose Your Card Style
          </h1>
          <p
            style={{
              color: "#8b949e",
              fontSize: "18px",
              margin: "0",
            }}
          >
            Review your information and select the perfect design for your
            professional card
          </p>
        </div>

        {/* User Data Section */}
        <UserDataDisplay />

        {/* Card Design Previews Section */}
        <div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#f0f6fc",
              textAlign: "center",
              margin: "0 0 32px 0",
            }}
          >
            Card Design Options
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "32px",
              marginBottom: "40px",
            }}
          >
            <CardPreview
              design="modern"
              title="Modern Dark"
              description="Sleek dark theme perfect for tech professionals"
              isSelected={selectedDesign === "modern"}
            />
            <CardPreview
              design="gradient"
              title="Gradient Style"
              description="Eye-catching gradient design that stands out"
              isSelected={selectedDesign === "gradient"}
            />
            <CardPreview
              design="minimal"
              title="Clean Minimal"
              description="Simple and professional white background"
              isSelected={selectedDesign === "minimal"}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            paddingTop: "32px",
            borderTop: "1px solid #21262d",
          }}
        >
          <button
            onClick={() => navigate("/details")}
            style={{
              padding: "16px 32px",
              backgroundColor: "#21262d",
              color: "#f0f6fc",
              border: "1px solid #30363d",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
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
            ← Back to Details
          </button>
          <button
            style={{
              padding: "16px 32px",
              backgroundColor: isGenerating ? "#6c757d" : "#238636",
              color: "#ffffff",
              border: `1px solid ${isGenerating ? "#6c757d" : "#238636"}`,
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: isGenerating ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              opacity: isGenerating ? 0.7 : 1,
            }}
            disabled={isGenerating}
            onMouseOver={(e) => {
              if (!isGenerating) {
                e.target.style.backgroundColor = "#2ea043";
                e.target.style.borderColor = "#2ea043";
              }
            }}
            onMouseOut={(e) => {
              if (!isGenerating) {
                e.target.style.backgroundColor = "#238636";
                e.target.style.borderColor = "#238636";
              }
            }}
            onClick={async () => {
              const confirmGenerate = window.confirm(
                `⚠️ IMPORTANT: Once you generate this card, it will be permanently saved and you won't be able to go back to modify your details.\n\nAre you sure you want to generate the ${selectedDesign} card?`
              );

              if (confirmGenerate) {
                setIsGenerating(true);

                try {
                  // Prepare card data for backend
                  const cardData = {
                    userId: userData?.id || userData?.userId,
                    firstName: userData?.firstName,
                    lastName: userData?.lastName,
                    professionalTitle: userData?.professionalTitle,
                    email: userData?.email,
                    phone: userData?.phone,
                    location: userData?.location,
                    linkedIn: userData?.linkedIn,
                    github: userData?.github,
                    portfolio: userData?.portfolio,
                    cardStyle: selectedDesign,
                    generatedAt: new Date().toISOString(),
                  };

                  // Save to database
                  const savedCard = await saveCardToBackend(cardData);

                  alert(
                    `✅ Card generated successfully!\nCard ID: ${savedCard.cardId}\nDesign: ${selectedDesign}`
                  );

                  if (onGenerate) {
                    onGenerate({
                      cardStyle: selectedDesign,
                      cardId: savedCard.cardId,
                      cardData: savedCard.data,
                    });
                  }

                  // Navigate to home page
                  navigate("/home");
                } catch (error) {
                  alert(`❌ Failed to generate card: ${error.message}`);
                } finally {
                  setIsGenerating(false);
                }
              }
            }}
          >
            {isGenerating
              ? "Generating..."
              : `Generate ${
                  selectedDesign.charAt(0).toUpperCase() +
                  selectedDesign.slice(1)
                } Card`}{" "}
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardStyles;
