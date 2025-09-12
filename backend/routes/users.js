import express from "express";
import { db } from "../config/database.js";

const router = express.Router();

// Get user by email
router.get("/email/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const query = "SELECT * FROM users WHERE email = ?";
    const users = await db.query(query, [email]);

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(users[0]);
  } catch (error) {
    console.error("Error fetching user by email:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Get user by ID
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const query = "SELECT * FROM users WHERE id = ?";
    const users = await db.query(query, [userId]);

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(users[0]);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Create new user
router.post("/", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      jobTitle,
      company,
      website,
      linkedin,
      twitter,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        error:
          "Missing required fields: firstName, lastName, and email are required",
      });
    }

    // Check if user already exists
    const existingUser = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (existingUser.length > 0) {
      return res
        .status(409)
        .json({ error: "User with this email already exists" });
    }

    const query = `
      INSERT INTO users (
        first_name, last_name, email, phone, 
        job_title, company, website, linkedin, twitter
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await db.query(query, [
      firstName,
      lastName,
      email,
      phone || null,
      jobTitle || null,
      company || null,
      website || null,
      linkedin || null,
      twitter || null,
    ]);

    // Fetch the created user
    const createdUser = await db.query("SELECT * FROM users WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json(createdUser[0]);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Update user
router.put("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const allowedFields = [
      "first_name",
      "last_name",
      "email",
      "phone",
      "job_title",
      "company",
      "website",
      "linkedin",
      "twitter",
    ];

    const updates = [];
    const values = [];

    // Build dynamic update query with only allowed fields
    Object.keys(updateData).forEach((key) => {
      const dbField = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      if (allowedFields.includes(dbField) && updateData[key] !== undefined) {
        updates.push(`${dbField} = ?`);
        values.push(updateData[key]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    // Add userId to values array
    values.push(userId);

    const query = `
      UPDATE users 
      SET ${updates.join(", ")} 
      WHERE id = ?
    `;

    const result = await db.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch updated user
    const updatedUser = await db.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    res.json(updatedUser[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

export default router;
