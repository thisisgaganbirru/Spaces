import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Mysql@9530",
  database: process.env.DB_NAME || "projectpfcard",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

async function fixSchema() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log("🔧 Fixing database schema...");

    // Check if status column exists, if not add it
    try {
      await connection.execute(`
        ALTER TABLE space_content 
        ADD COLUMN status ENUM('active', 'deleted') DEFAULT 'active'
      `);
      console.log("✅ Added status column to space_content");
    } catch (error) {
      if (error.code === "ER_DUP_FIELDNAME") {
        console.log("✅ Status column already exists in space_content");
      } else {
        throw error;
      }
    }

    // Check if file_content column exists, if not add it
    try {
      await connection.execute(`
        ALTER TABLE file_uploads 
        ADD COLUMN file_content LONGTEXT NULL
      `);
      console.log("✅ Added file_content column to file_uploads");
    } catch (error) {
      if (error.code === "ER_DUP_FIELDNAME") {
        console.log("✅ File_content column already exists in file_uploads");
      } else {
        throw error;
      }
    }

    // Clean up bad JSON data
    const result = await connection.execute(`
      UPDATE space_content 
      SET data = '{}' 
      WHERE data = '[object Object]' OR data LIKE '[object%'
    `);
    console.log(`✅ Cleaned up ${result[0].affectedRows} bad JSON records`);

    // Add indexes for performance
    try {
      await connection.execute(`
        CREATE INDEX idx_space_content_space_status 
        ON space_content(space_id, status)
      `);
      console.log("✅ Added space_content index");
    } catch (error) {
      if (error.code === "ER_DUP_KEYNAME") {
        console.log("✅ Space_content index already exists");
      } else {
        console.warn("⚠️ Could not create space_content index:", error.message);
      }
    }

    try {
      await connection.execute(`
        CREATE INDEX idx_file_uploads_content_active 
        ON file_uploads(content_id, is_active)
      `);
      console.log("✅ Added file_uploads index");
    } catch (error) {
      if (error.code === "ER_DUP_KEYNAME") {
        console.log("✅ File_uploads index already exists");
      } else {
        console.warn("⚠️ Could not create file_uploads index:", error.message);
      }
    }

    console.log("🎉 Schema fix completed successfully!");
  } catch (error) {
    console.error("❌ Schema fix failed:", error);
  } finally {
    await connection.end();
  }
}

fixSchema();
