import express from "express";
import { db } from "../config/database.js";

const router = express.Router();

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Get all root spaces (spaces without parent)
router.get("/root", async (req, res) => {
  try {
    const query = `
      SELECT * FROM space_hierarchy 
      WHERE parent_space_id IS NULL 
      ORDER BY created_at DESC
    `;
    const spaces = await db.query(query);
    res.json(spaces);
  } catch (error) {
    console.error("Error fetching root spaces:", error);
    res.status(500).json({ error: "Failed to fetch root spaces" });
  }
});

// Get spaces by user ID
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const query = `
      SELECT * FROM space_hierarchy 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    const spaces = await db.query(query, [userId]);
    res.json(spaces);
  } catch (error) {
    console.error("Error fetching user spaces:", error);
    res.status(500).json({ error: "Failed to fetch user spaces" });
  }
});

// Get root spaces by user ID
router.get("/user/:userId/root", async (req, res) => {
  try {
    const { userId } = req.params;
    const query = `
      SELECT * FROM space_hierarchy 
      WHERE user_id = ? AND parent_space_id IS NULL 
      ORDER BY created_at DESC
    `;
    const spaces = await db.query(query, [userId]);
    res.json(spaces);
  } catch (error) {
    console.error("Error fetching user root spaces:", error);
    res.status(500).json({ error: "Failed to fetch user root spaces" });
  }
});

// Get space by ID
router.get("/:spaceId", async (req, res) => {
  try {
    const { spaceId } = req.params;
    const query = `
      SELECT * FROM space_hierarchy 
      WHERE space_id = ?
    `;
    const spaces = await db.query(query, [spaceId]);

    if (spaces.length === 0) {
      return res.status(404).json({ error: "Space not found" });
    }

    res.json(spaces[0]);
  } catch (error) {
    console.error("Error fetching space by ID:", error);
    res.status(500).json({ error: "Failed to fetch space" });
  }
});

// Get child spaces of a parent space
router.get("/:spaceId/children", async (req, res) => {
  try {
    const { spaceId } = req.params;
    const query = `
      SELECT * FROM space_hierarchy 
      WHERE parent_space_id = ? 
      ORDER BY created_at DESC
    `;
    const childSpaces = await db.query(query, [spaceId]);
    res.json(childSpaces);
  } catch (error) {
    console.error("Error fetching child spaces:", error);
    res.status(500).json({ error: "Failed to fetch child spaces" });
  }
});

// Create a new space
router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      color,
      userId,
      parentId = null,
      isChildSpace = false,
    } = req.body;

    // Validate required fields
    if (!name || !userId) {
      return res.status(400).json({
        error: "Missing required fields: name and userId are required",
      });
    }

    // Generate unique space ID
    const spaceId = `SPACE_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const query = `
      INSERT INTO spaces (
        space_id, 
        name, 
        description, 
        color, 
        user_id, 
        parent_space_id, 
        is_child_space
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [
      spaceId,
      name,
      description || "No description provided",
      color || "#3498db",
      userId,
      parentId,
      isChildSpace,
    ]);

    // Fetch the created space
    const createdSpace = await db.query(
      "SELECT * FROM space_hierarchy WHERE space_id = ?",
      [spaceId]
    );

    res.status(201).json(createdSpace[0]);
  } catch (error) {
    console.error("Error creating space:", error);
    res.status(500).json({ error: "Failed to create space" });
  }
});

// Update space
router.put("/:spaceId", async (req, res) => {
  try {
    const { spaceId } = req.params;
    const updateData = req.body;

    const allowedFields = ["name", "description", "color"];
    const updates = [];
    const values = [];

    // Build dynamic update query with only allowed fields
    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    // Add spaceId to values array
    values.push(spaceId);

    const query = `
      UPDATE spaces 
      SET ${updates.join(", ")} 
      WHERE space_id = ?
    `;

    const result = await db.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Space not found" });
    }

    // Fetch updated space
    const updatedSpace = await db.query(
      "SELECT * FROM space_hierarchy WHERE space_id = ?",
      [spaceId]
    );

    res.json(updatedSpace[0]);
  } catch (error) {
    console.error("Error updating space:", error);
    res.status(500).json({ error: "Failed to update space" });
  }
});

// Delete space
router.delete("/:spaceId", async (req, res) => {
  try {
    const { spaceId } = req.params;

    // Check if space exists
    const existingSpace = await db.query(
      "SELECT * FROM spaces WHERE space_id = ?",
      [spaceId]
    );

    if (existingSpace.length === 0) {
      return res.status(404).json({ error: "Space not found" });
    }

    // Delete space (cascade will handle child spaces and content)
    const query = "DELETE FROM spaces WHERE space_id = ?";
    const result = await db.query(query, [spaceId]);

    if (result.affectedRows > 0) {
      res.json({
        message: "Space deleted successfully",
        deletedSpaceId: spaceId,
      });
    } else {
      res.status(404).json({ error: "Space not found" });
    }
  } catch (error) {
    console.error("Error deleting space:", error);
    res.status(500).json({ error: "Failed to delete space" });
  }
});

// Add content to a space
router.post("/:spaceId/content", async (req, res) => {
  try {
    const { spaceId } = req.params;
    const { type, data } = req.body;

    // Validate required fields
    if (!type || !data) {
      return res.status(400).json({
        error: "Missing required fields: type and data are required",
      });
    }

    // Generate unique content ID
    const contentId = `CONTENT_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Begin transaction for proper data consistency
    // await db.query("START TRANSACTION");

    // try {
    // Insert into space_content first
    const spaceContentQuery = `
        INSERT INTO space_content (
          content_id, 
          space_id, 
          type, 
          data
        ) VALUES (?, ?, ?, ?)
      `;

    // For uploads, store minimal metadata in space_content
    let contentData = data;
    if (type === "upload") {
      contentData = {
        fileName: data.fileName,
        description: data.description || "",
      };
    }

    await db.query(spaceContentQuery, [
      contentId,
      spaceId,
      type,
      JSON.stringify(contentData),
    ]);

    // If this is an upload, also insert into file_uploads table
    if (type === "upload" && data.fileContent) {
      const fileId = `FILE_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Extract file extension from filename
      const fileExtension = data.fileName
        ? data.fileName.split(".").pop().toLowerCase()
        : "";

      // Calculate file size from base64 content
      const fileSize = data.fileContent
        ? Math.round((data.fileContent.length * 3) / 4)
        : 0;

      const fileUploadQuery = `
        INSERT INTO file_uploads (
          file_id,
          user_id,
          content_id,
          upload_context,
          upload_type,
          original_filename,
          storage_path,
          file_size,
          mime_type,
          file_extension,
          file_content,
          is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `;

      await db.query(fileUploadQuery, [
        fileId,
        1, // TODO: Get actual user_id from session/auth
        contentId,
        "space_content",
        "document", // TODO: Determine upload_type from file extension
        data.fileName,
        `/uploads/${fileId}`, // Virtual storage path
        fileSize,
        data.fileType || "application/octet-stream",
        fileExtension,
        data.fileContent, // Store actual file content in file_uploads table
      ]);
    }

    // Fetch the created content with file data if applicable
    const fetchQuery = `
        SELECT 
          sc.content_id, 
          sc.space_id, 
          sc.type, 
          sc.data,
          sc.status, 
          sc.created_at, 
          sc.updated_at,
          fu.file_id,
          fu.original_filename,
          fu.storage_path,
          fu.file_size,
          fu.mime_type,
          fu.file_extension
        FROM space_content sc
        LEFT JOIN file_uploads fu ON sc.content_id = fu.content_id AND fu.is_active = 1
        WHERE sc.content_id = ?
      `;

    const createdContent = await db.query(fetchQuery, [contentId]);
    const content = createdContent[0];

    // Parse JSON data
    if (content.data) {
      try {
        content.data = JSON.parse(content.data);
      } catch (e) {
        console.warn("Failed to parse content data JSON:", e);
      }
    }

    // For upload type, merge file_uploads data into the response
    if (content.type === "upload" && content.file_id) {
      content.data = {
        ...content.data,
        fileName: content.original_filename,
        fileSize: content.file_size,
        fileType: content.mime_type,
        fileExtension: content.file_extension,
        filePath: content.storage_path,
        fileSizeFormatted: formatFileSize(content.file_size),
      };

      // Remove the raw file_uploads columns from the response
      delete content.file_id;
      delete content.original_filename;
      delete content.storage_path;
      delete content.file_size;
      delete content.mime_type;
      delete content.file_extension;
    }

    res.status(201).json(content);
  } catch (error) {
    console.error("Error adding content to space:", error);
    res.status(500).json({ error: "Failed to add content to space" });
  }
});

// Get content for a space
router.get("/:spaceId/content", async (req, res) => {
  try {
    const { spaceId } = req.params;

    // First get space_content without JOIN to avoid memory issues
    const spaceContentQuery = `
      SELECT 
        content_id, 
        space_id, 
        type, 
        data,
        status, 
        created_at, 
        updated_at
      FROM space_content
      WHERE space_id = ? AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 100
    `;

    const content = await db.query(spaceContentQuery, [spaceId]);

    // For each upload item, get file metadata separately (without file_content)
    const enrichedContent = await Promise.all(
      content.map(async (item) => {
        // Parse JSON data for space_content
        if (item.data) {
          try {
            // Check if data is already parsed or if it's a string
            if (typeof item.data === "string") {
              // Handle cases where data is "[object Object]" or invalid JSON
              if (
                item.data === "[object Object]" ||
                item.data.startsWith("[object")
              ) {
                console.warn(
                  "Invalid JSON data detected, setting to empty object:",
                  item.data
                );
                item.data = {};
              } else {
                item.data = JSON.parse(item.data);
              }
            }
          } catch (e) {
            console.warn(
              "Failed to parse content data JSON:",
              e,
              "Data:",
              item.data
            );
            item.data = {}; // Set to empty object on parse failure
          }
        }

        // For upload type, get file metadata separately
        if (item.type === "upload") {
          try {
            const fileQuery = `
              SELECT 
                file_id,
                original_filename,
                storage_path,
                file_size,
                mime_type,
                file_extension
              FROM file_uploads
              WHERE content_id = ? AND is_active = 1
            `;

            const fileData = await db.query(fileQuery, [item.content_id]);

            if (fileData.length > 0) {
              const file = fileData[0];
              item.data = {
                ...item.data,
                fileName: file.original_filename,
                fileSize: file.file_size,
                fileType: file.mime_type,
                fileExtension: file.file_extension,
                filePath: file.storage_path,
                fileSizeFormatted: formatFileSize(file.file_size),
              };
            }
          } catch (fileError) {
            console.warn("Error fetching file metadata:", fileError);
          }
        }

        return item;
      })
    );

    res.json(enrichedContent);
  } catch (error) {
    console.error("Error fetching space content:", error);
    res.status(500).json({ error: "Failed to fetch space content" });
  }
});

// Get full file data for preview (including file content)
router.get("/:spaceId/content/:contentId/full", async (req, res) => {
  try {
    const { spaceId, contentId } = req.params;

    const query = `
      SELECT 
        sc.content_id, 
        sc.space_id, 
        sc.type, 
        sc.data,
        sc.status, 
        sc.created_at, 
        sc.updated_at,
        fu.file_id,
        fu.original_filename,
        fu.storage_path,
        fu.file_size,
        fu.mime_type,
        fu.file_extension,
        fu.file_content
      FROM space_content sc
      LEFT JOIN file_uploads fu ON sc.content_id = fu.content_id AND fu.is_active = 1
      WHERE sc.space_id = ? AND sc.content_id = ? AND sc.status = 'active'
    `;

    const content = await db.query(query, [spaceId, contentId]);

    if (content.length === 0) {
      return res.status(404).json({ error: "Content not found" });
    }

    const item = content[0];

    // Parse JSON data
    if (item.data) {
      try {
        // Check if data is already parsed or if it's a string
        if (typeof item.data === "string") {
          // Handle cases where data is "[object Object]" or invalid JSON
          if (
            item.data === "[object Object]" ||
            item.data.startsWith("[object")
          ) {
            console.warn(
              "Invalid JSON data detected, setting to empty object:",
              item.data
            );
            item.data = {};
          } else {
            item.data = JSON.parse(item.data);
          }
        }
      } catch (e) {
        console.warn(
          "Failed to parse content data JSON:",
          e,
          "Data:",
          item.data
        );
        item.data = {}; // Set to empty object on parse failure
      }
    }

    // For upload type, merge file_uploads data including file content
    if (item.type === "upload" && item.file_id) {
      item.data = {
        ...item.data,
        fileName: item.original_filename,
        fileSize: item.file_size,
        fileType: item.mime_type,
        fileExtension: item.file_extension,
        filePath: item.storage_path,
        fileSizeFormatted: formatFileSize(item.file_size),
        fileContent: item.file_content, // Get file content from file_uploads table
      };

      // Remove the raw file_uploads columns from the response
      delete item.file_id;
      delete item.original_filename;
      delete item.storage_path;
      delete item.file_size;
      delete item.mime_type;
      delete item.file_extension;
      delete item.file_content;
    }

    res.json(item);
  } catch (error) {
    console.error("Error fetching full content:", error);
    res.status(500).json({ error: "Failed to fetch full content" });
  }
});

// Update content status (soft delete)
router.patch("/:spaceId/content/:contentId", async (req, res) => {
  try {
    const { spaceId, contentId } = req.params;
    const { action } = req.body;

    if (action === "soft_delete") {
      const query = `
        UPDATE space_content 
        SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
        WHERE content_id = ? AND space_id = ?
      `;
      const result = await db.query(query, [contentId, spaceId]);

      if (result.affectedRows > 0) {
        res.json({
          message: "Content moved to deleted status",
          contentId: contentId,
          action: "soft_delete",
        });
      } else {
        res.status(404).json({ error: "Content not found" });
      }
    } else {
      res.status(400).json({ error: "Invalid action. Use 'soft_delete'" });
    }
  } catch (error) {
    console.error("Error updating content status:", error);
    res.status(500).json({ error: "Failed to update content status" });
  }
});

// Delete content from a space (permanently)
router.delete("/:spaceId/content/:contentId", async (req, res) => {
  try {
    const { spaceId, contentId } = req.params;
    const query = `
      DELETE FROM space_content 
      WHERE content_id = ? AND space_id = ?
    `;
    const result = await db.query(query, [contentId, spaceId]);

    if (result.affectedRows > 0) {
      res.json({
        message: "Content permanently deleted",
        deletedContentId: contentId,
      });
    } else {
      res.status(404).json({ error: "Content not found" });
    }
  } catch (error) {
    console.error("Error permanently deleting content:", error);
    res.status(500).json({ error: "Failed to permanently delete content" });
  }
});

export default router;
