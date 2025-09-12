import express from "express";
import { db } from "../config/database.js";

const router = express.Router();

// Get all card styles
router.get("/styles", async (req, res) => {
  try {
    const query = "SELECT * FROM card_styles ORDER BY id";
    const styles = await db.query(query);
    res.json(styles);
  } catch (error) {
    console.error("Error fetching card styles:", error);
    res.status(500).json({ error: "Failed to fetch card styles" });
  }
});

// Get card by ID
router.get("/:cardId", async (req, res) => {
  try {
    const { cardId } = req.params;
    const query = "SELECT * FROM card_details WHERE card_id = ?";
    const cards = await db.query(query, [cardId]);

    if (cards.length === 0) {
      return res.status(404).json({ error: "Card not found" });
    }

    // Parse JSON fields
    const card = cards[0];
    if (card.card_data) {
      try {
        card.card_data = JSON.parse(card.card_data);
      } catch (e) {
        console.warn("Failed to parse card_data JSON:", e);
      }
    }

    res.json(card);
  } catch (error) {
    console.error("Error fetching card by ID:", error);
    res.status(500).json({ error: "Failed to fetch card" });
  }
});

// Get cards by user ID
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const query = `
      SELECT * FROM card_details 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    const cards = await db.query(query, [userId]);

    // Parse JSON fields for each card
    const parsedCards = cards.map((card) => {
      if (card.card_data) {
        try {
          card.card_data = JSON.parse(card.card_data);
        } catch (e) {
          console.warn("Failed to parse card_data JSON:", e);
        }
      }
      return card;
    });

    res.json(parsedCards);
  } catch (error) {
    console.error("Error fetching user cards:", error);
    res.status(500).json({ error: "Failed to fetch user cards" });
  }
});

// Generate/Create new card
router.post("/", async (req, res) => {
  try {
    const { userId, cardStyle = "modern", cardData, qrCodeUrl } = req.body;

    // Validate required fields
    if (!userId || !cardData) {
      return res.status(400).json({
        error: "Missing required fields: userId and cardData are required",
      });
    }

    // Generate unique card ID
    const cardId = `CARD_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const query = `
      INSERT INTO cards (
        card_id, 
        user_id, 
        style_name, 
        card_data,
        qr_code_url
      ) VALUES (?, ?, ?, ?, ?)
    `;

    await db.query(query, [
      cardId,
      userId,
      cardStyle,
      JSON.stringify(cardData),
      qrCodeUrl || null,
    ]);

    // Fetch the created card with full details
    const createdCard = await db.query(
      "SELECT * FROM card_details WHERE card_id = ?",
      [cardId]
    );

    if (createdCard.length > 0) {
      const card = createdCard[0];
      if (card.card_data) {
        try {
          card.card_data = JSON.parse(card.card_data);
        } catch (e) {
          console.warn("Failed to parse card_data JSON:", e);
        }
      }
      res.status(201).json(card);
    } else {
      res.status(500).json({ error: "Failed to retrieve created card" });
    }
  } catch (error) {
    console.error("Error creating card:", error);
    res.status(500).json({ error: "Failed to create card" });
  }
});

// Update card
router.put("/:cardId", async (req, res) => {
  try {
    const { cardId } = req.params;
    const { cardStyle, cardData, qrCodeUrl } = req.body;

    const updates = [];
    const values = [];

    if (cardStyle !== undefined) {
      updates.push("style_name = ?");
      values.push(cardStyle);
    }

    if (cardData !== undefined) {
      updates.push("card_data = ?");
      values.push(JSON.stringify(cardData));
    }

    if (qrCodeUrl !== undefined) {
      updates.push("qr_code_url = ?");
      values.push(qrCodeUrl);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    // Add cardId to values array
    values.push(cardId);

    const query = `
      UPDATE cards 
      SET ${updates.join(", ")} 
      WHERE card_id = ?
    `;

    const result = await db.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Card not found" });
    }

    // Fetch updated card
    const updatedCard = await db.query(
      "SELECT * FROM card_details WHERE card_id = ?",
      [cardId]
    );

    if (updatedCard.length > 0) {
      const card = updatedCard[0];
      if (card.card_data) {
        try {
          card.card_data = JSON.parse(card.card_data);
        } catch (e) {
          console.warn("Failed to parse card_data JSON:", e);
        }
      }
      res.json(card);
    } else {
      res.status(500).json({ error: "Failed to retrieve updated card" });
    }
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(500).json({ error: "Failed to update card" });
  }
});

// Delete card
router.delete("/:cardId", async (req, res) => {
  try {
    const { cardId } = req.params;

    // Check if card exists
    const existingCard = await db.query(
      "SELECT * FROM cards WHERE card_id = ?",
      [cardId]
    );

    if (existingCard.length === 0) {
      return res.status(404).json({ error: "Card not found" });
    }

    // Delete card (cascade will handle related records)
    const query = "DELETE FROM cards WHERE card_id = ?";
    const result = await db.query(query, [cardId]);

    if (result.affectedRows > 0) {
      res.json({
        message: "Card deleted successfully",
        deletedCardId: cardId,
      });
    } else {
      res.status(404).json({ error: "Card not found" });
    }
  } catch (error) {
    console.error("Error deleting card:", error);
    res.status(500).json({ error: "Failed to delete card" });
  }
});

export default router;
