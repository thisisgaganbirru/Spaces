const API_BASE_URL = "http://localhost:3001/api";

// Get all card styles
const getAllCardStyles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/cards/styles`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const styles = await response.json();
    console.log("Fetched card styles:", styles);
    return styles;
  } catch (error) {
    console.error("Error fetching card styles:", error);
    throw error;
  }
};

// Get card style by name
const getCardStyleByName = async (styleName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cards/styles/${styleName}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const style = await response.json();
    console.log("Fetched card style by name:", style);
    return style;
  } catch (error) {
    console.error("Error fetching card style by name:", error);
    throw error;
  }
};

// Generate/Create a new card
const generateCard = async (cardData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cardData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Card generated successfully:", result);
    return result;
  } catch (error) {
    console.error("Error generating card:", error);
    throw error;
  }
};

// Get cards by user ID
const getUserCards = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cards/user/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const cards = await response.json();
    console.log("Fetched user cards:", cards);
    return cards;
  } catch (error) {
    console.error("Error fetching user cards:", error);
    throw error;
  }
};

// Get card by ID
const getCardById = async (cardId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cards/${cardId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const card = await response.json();
    console.log("Fetched card by ID:", card);
    return card;
  } catch (error) {
    console.error("Error fetching card by ID:", error);
    throw error;
  }
};

// Update card
const updateCard = async (cardId, updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cards/${cardId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Card updated successfully:", result);
    return result;
  } catch (error) {
    console.error("Error updating card:", error);
    throw error;
  }
};

// Delete card
const deleteCard = async (cardId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cards/${cardId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Card deleted successfully:", result);
    return result;
  } catch (error) {
    console.error("Error deleting card:", error);
    throw error;
  }
};

// Export the service
export const cardService = {
  getAllCardStyles,
  getCardStyleByName,
  generateCard,
  getUserCards,
  getCardById,
  updateCard,
  deleteCard,
};

// Default export
export default cardService;
