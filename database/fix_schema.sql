-- Fix database schema for proper file upload handling
-- Add missing status column to space_content
ALTER TABLE space_content ADD COLUMN IF NOT EXISTS status ENUM('active', 'deleted') DEFAULT 'active';

-- Add file_content column to file_uploads to store actual file data
ALTER TABLE file_uploads ADD COLUMN IF NOT EXISTS file_content LONGTEXT NULL;

-- Clean up any bad JSON data
UPDATE space_content SET data = '{}' WHERE data = '[object Object]' OR data LIKE '[object%';

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_space_content_space_status ON space_content(space_id, status);
CREATE INDEX IF NOT EXISTS idx_file_uploads_content_active ON file_uploads(content_id, is_active);

-- Show current schema
DESCRIBE space_content;
DESCRIBE file_uploads;
