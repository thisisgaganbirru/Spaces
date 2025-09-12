-- Add status field to space_content table for soft delete functionality
-- Run this script to update the existing database schema

USE projectpfcard;

-- Add status column to space_content table
ALTER TABLE space_content 
ADD COLUMN status ENUM('active', 'deleted') DEFAULT 'active' 
AFTER updated_at;

-- Update existing records to have 'active' status
UPDATE space_content SET status = 'active' WHERE status IS NULL;

-- Update the getSpaceContent queries to only show active content by default
-- This will be handled in the backend route updates
