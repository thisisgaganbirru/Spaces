import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Mysql@9530",
  database: process.env.DB_NAME || "projectpfcard",
};

async function verifySchema() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log("🔍 Verifying database schema...");

    // Check space_content structure
    const [spaceContentCols] = await connection.execute(
      "DESCRIBE space_content"
    );
    console.log("\n📋 space_content table structure:");
    spaceContentCols.forEach((col) => {
      console.log(
        `  ${col.Field}: ${col.Type} ${
          col.Null === "NO" ? "NOT NULL" : "NULL"
        } ${col.Key ? `[${col.Key}]` : ""}`
      );
    });

    // Check file_uploads structure
    const [fileUploadsCols] = await connection.execute("DESCRIBE file_uploads");
    console.log("\n📋 file_uploads table structure:");
    fileUploadsCols.forEach((col) => {
      console.log(
        `  ${col.Field}: ${col.Type} ${
          col.Null === "NO" ? "NOT NULL" : "NULL"
        } ${col.Key ? `[${col.Key}]` : ""}`
      );
    });

    // Check foreign key relationships
    const [fks] = await connection.execute(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE REFERENCED_TABLE_SCHEMA = 'projectpfcard'
      AND TABLE_NAME IN ('space_content', 'file_uploads')
    `);

    console.log("\n🔗 Foreign key relationships:");
    fks.forEach((fk) => {
      console.log(
        `  ${fk.TABLE_NAME}.${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`
      );
    });

    // Check for existing data
    const [contentCount] = await connection.execute(
      "SELECT COUNT(*) as count FROM space_content"
    );
    const [uploadCount] = await connection.execute(
      "SELECT COUNT(*) as count FROM file_uploads"
    );

    console.log(`\n📊 Current data:`);
    console.log(`  space_content records: ${contentCount[0].count}`);
    console.log(`  file_uploads records: ${uploadCount[0].count}`);

    console.log("\n✅ Schema verification complete!");
  } catch (error) {
    console.error("❌ Schema verification failed:", error);
  } finally {
    await connection.end();
  }
}

verifySchema();
