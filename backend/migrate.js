import { db } from "./config/database.js";

const addStatusColumn = async () => {
  try {
    console.log("Adding status column to space_content table...");

    // Add status column
    await db.query(`
      ALTER TABLE space_content 
      ADD COLUMN status ENUM('active', 'deleted') DEFAULT 'active'
    `);

    console.log("Status column added successfully!");

    // Update existing records
    await db.query(
      "UPDATE space_content SET status = 'active' WHERE status IS NULL"
    );

    console.log("Existing records updated to active status!");

    process.exit(0);
  } catch (error) {
    if (error.message.includes("Duplicate column name")) {
      console.log("Status column already exists!");
      process.exit(0);
    }
    console.error("Error adding status column:", error);
    process.exit(1);
  }
};

addStatusColumn();
