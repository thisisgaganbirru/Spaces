import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CardStyles from "../CardStyles";
import { cardService } from "../../services/cardService";

const Home = ({ userData, onGenerate, cardGenerated }) => {
  const navigate = useNavigate();
  const [selectedDesign, setSelectedDesign] = React.useState(
    userData?.getCardStyle || "modern"
  );
  const [generatedCards, setGeneratedCards] = React.useState([]);
  const [currentCardId, setCurrentCardId] = React.useState(null);

  // Load user's existing cards on component mount
  useEffect(() => {
    const loadUserCards = async () => {
      if (userData?.id) {
        try {
          const userCards = await cardService.getUserCards(userData.id);
          if (userCards.length > 0) {
            const latestCard = userCards[0];
            setCurrentCardId(latestCard.card_id);
            setSelectedDesign(latestCard.style_name);
            setGeneratedCards(userCards);
          }
        } catch (error) {
          console.error("Error loading user cards:", error);
        }
      }
    };

    loadUserCards();
  }, [userData]);

  const handleGenerate = (cardData) => {
    setSelectedDesign(cardData.cardStyle || cardData);
    setCurrentCardId(cardData.cardId);

    // Add to generated cards list
    if (cardData.cardId) {
      setGeneratedCards((prev) => [...prev, cardData]);
    }

    if (onGenerate) onGenerate(cardData);
  };

  const handleDesignSelect = (design) => {
    setSelectedDesign(design);
  };

  return (
    <div className="home" style={{ minHeight: "100vh", width: "100vw" }}>
      {/* Main content area */}
      <main
        className="main-content"
        style={{
          padding: "2rem",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
          minHeight: "calc(100vh - 200px)",
        }}
      >
        <div
          className="home-content"
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "3rem",
          }}
        >
          {/* Welcome Section */}
          <div
            className="user-welcome"
            style={{
              textAlign: "center",
              width: "100%",
              maxWidth: "800px",
            }}
          >
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                color: "#2c3e50",
                margin: "0",
                marginBottom: "0.5rem",
              }}
            >
              Welcome Back, {userData?.firstName || "John"}!
            </h1>
            <p
              style={{
                fontSize: "1.1rem",
                color: "#7f8c8d",
                margin: "0",
                fontWeight: "400",
              }}
            >
              Manage your professional digital business card
            </p>
          </div>

          {/* Main Card Container */}
          <div
            className="card-container"
            style={{
              width: "100%",
              maxWidth: "900px",
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
              padding: "3rem",
              border: "1px solid #f1f3f4",
            }}
          >
            {/* Card Display Section */}
            <div
              className="card-display"
              style={{
                width: "90%",
                minHeight: "50px",
                backgroundColor: "#f8f9fa",
                borderRadius: "16px",
                padding: "2.5rem",
                marginBottom: "2.5rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                border: "2px dashed #e9ecef",
                transition: "all 0.3s ease",
              }}
            >
              {currentCardId ? (
                // Card Generated Successfully
                <div
                  style={{
                    textAlign: "center",
                    width: "90%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "4rem",
                      marginBottom: "1rem",
                    }}
                  >
                    🎉
                  </div>
                  <h2
                    style={{
                      color: "#27ae60",
                      margin: "0",
                      fontSize: "1.8rem",
                      fontWeight: "600",
                    }}
                  >
                    Your Card is Ready!
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "1rem",
                        color: "#34495e",
                        padding: "1rem 1.5rem",
                        backgroundColor: "#ecf0f1",
                        borderRadius: "12px",
                        fontFamily: "monospace",
                        fontWeight: "500",
                        border: "1px solid #bdc3c7",
                      }}
                    >
                      Card ID: {currentCardId}
                    </div>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        color: "#7f8c8d",
                        padding: "0.75rem 1.25rem",
                        backgroundColor: "#ffffff",
                        borderRadius: "8px",
                        border: "1px solid #e1e8ed",
                        textTransform: "capitalize",
                        fontWeight: "500",
                      }}
                    >
                      Style: {selectedDesign}
                    </div>
                  </div>
                </div>
              ) : (
                // No Card Generated
                <div
                  style={{
                    textAlign: "center",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "2rem",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        color: "#34495e",
                        margin: "0 0 1rem 0",
                        fontSize: "1.6rem",
                        fontWeight: "600",
                      }}
                    >
                      Create Your Professional Card
                    </h3>
                    <p
                      style={{
                        color: "#7f8c8d",
                        margin: "0",
                        lineHeight: "1.6",
                        fontSize: "1rem",
                        maxWidth: "400px",
                      }}
                    >
                      Start by filling in your professional details to generate
                      your digital business card
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                      width: "100%",
                      maxWidth: "300px",
                    }}
                  >
                    <button
                      style={{
                        padding: "1rem 2rem",
                        backgroundColor: "#3498db",
                        color: "#fff",
                        border: "none",
                        borderRadius: "12px",
                        cursor: "pointer",
                        fontSize: "1rem",
                        fontWeight: "600",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 15px rgba(52, 152, 219, 0.3)",
                      }}
                      onClick={() => {
                        navigate("/details");
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = "#2980b9";
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow =
                          "0 6px 20px rgba(52, 152, 219, 0.4)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = "#3498db";
                        e.target.style.transform = "translateY(0px)";
                        e.target.style.boxShadow =
                          "0 4px 15px rgba(52, 152, 219, 0.3)";
                      }}
                    >
                      Create My Card
                    </button>
                    <button
                      style={{
                        padding: "0.875rem 1.75rem",
                        backgroundColor: "transparent",
                        color: "#3498db",
                        border: "2px solid #3498db",
                        borderRadius: "12px",
                        cursor: "pointer",
                        fontSize: "0.95rem",
                        fontWeight: "500",
                        transition: "all 0.3s ease",
                      }}
                      onClick={() => {
                        navigate("/card-styles");
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = "#3498db";
                        e.target.style.color = "#fff";
                        e.target.style.transform = "translateY(-1px)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.color = "#3498db";
                        e.target.style.transform = "translateY(0px)";
                      }}
                    >
                      Browse Styles
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Trackable URL Section */}
            <div
              className="url-section"
              style={{
                backgroundColor: "#f8f9fa",
                borderRadius: "16px",
                padding: "2rem",
                marginBottom: "2rem",
                border: "1px solid #e9ecef",
              }}
            >
              <h3
                style={{
                  margin: "0 0 1.5rem 0",
                  fontSize: "1.3rem",
                  fontWeight: "600",
                  color: "#2c3e50",
                  textAlign: "center",
                }}
              >
                🔗 Your Trackable Resume URL
              </h3>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 1.25rem",
                  backgroundColor: "#ffffff",
                  border: "2px solid #e9ecef",
                  borderRadius: "12px",
                  fontSize: "0.95rem",
                  fontFamily: "monospace",
                  color: "#495057",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                }}
              >
                <span style={{ flex: 1, wordBreak: "break-all" }}>
                  https://cardchain.app/track/
                  {userData?.firstName?.toLowerCase() || "john"}
                  _2025/software-engineer
                </span>
                <button
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#27ae60",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => {
                    const url = `https://cardchain.app/track/${
                      userData?.firstName?.toLowerCase() || "john"
                    }_2025/software-engineer`;
                    navigator.clipboard.writeText(url);
                    alert("URL copied to clipboard!");
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = "#219a52";
                    e.target.style.transform = "scale(1.05)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = "#27ae60";
                    e.target.style.transform = "scale(1)";
                  }}
                >
                  Copy URL
                </button>
              </div>
            </div>

            {/* Download Buttons Section */}
            <div
              className="download-section"
              style={{
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  margin: "0 0 1.5rem 0",
                  fontSize: "1.3rem",
                  fontWeight: "600",
                  color: "#2c3e50",
                }}
              >
                📥 Download Your Card
              </h3>
              <div
                className="download-buttons"
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  style={{
                    flex: "1",
                    minWidth: "140px",
                    padding: "1rem 1.5rem",
                    backgroundColor: "#e74c3c",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 15px rgba(231, 76, 60, 0.3)",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = "#c0392b";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 6px 20px rgba(231, 76, 60, 0.4)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = "#e74c3c";
                    e.target.style.transform = "translateY(0px)";
                    e.target.style.boxShadow =
                      "0 4px 15px rgba(231, 76, 60, 0.3)";
                  }}
                >
                  📄 PDF
                </button>
                <button
                  style={{
                    flex: "1",
                    minWidth: "140px",
                    padding: "1rem 1.5rem",
                    backgroundColor: "#f39c12",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 15px rgba(243, 156, 18, 0.3)",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = "#e67e22";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 6px 20px rgba(243, 156, 18, 0.4)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = "#f39c12";
                    e.target.style.transform = "translateY(0px)";
                    e.target.style.boxShadow =
                      "0 4px 15px rgba(243, 156, 18, 0.3)";
                  }}
                >
                  🖼️ JPG
                </button>
                <button
                  style={{
                    flex: "1",
                    minWidth: "140px",
                    padding: "1rem 1.5rem",
                    backgroundColor: "#9b59b6",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 15px rgba(155, 89, 182, 0.3)",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = "#8e44ad";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 6px 20px rgba(155, 89, 182, 0.4)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = "#9b59b6";
                    e.target.style.transform = "translateY(0px)";
                    e.target.style.boxShadow =
                      "0 4px 15px rgba(155, 89, 182, 0.3)";
                  }}
                >
                  🖼️ PNG
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
