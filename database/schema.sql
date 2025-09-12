-- Create database
CREATE DATABASE IF NOT EXISTS projectpfcard;
USE projectpfcard;

-- Users table to store user information
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(100),
    professional_title VARCHAR(100),
    linkedin_url VARCHAR(200),
    github_url VARCHAR(200),
    portfolio_url VARCHAR(200),
    resume_url VARCHAR(500),        -- Resume URL (if provided as link)
    resume_file_path VARCHAR(500),  -- Path to uploaded resume file
    resume_filename VARCHAR(255),   -- Original filename
    resume_file_size BIGINT,        -- File size in bytes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Card styles table to store available design templates
CREATE TABLE IF NOT EXISTS card_styles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    style_name VARCHAR(50) UNIQUE NOT NULL,
    style_description TEXT,
    is_gradient BOOLEAN DEFAULT FALSE,
    background_color VARCHAR(7),
    text_color VARCHAR(7),
    gradient_start VARCHAR(7),
    gradient_end VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cards table to store generated cards
CREATE TABLE IF NOT EXISTS cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    card_id VARCHAR(100) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    card_style_id INT NOT NULL,
    card_data JSON,
    is_active BOOLEAN DEFAULT TRUE,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (card_style_id) REFERENCES card_styles(id)
);

-- Spaces table to store user spaces
CREATE TABLE IF NOT EXISTS spaces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    space_id VARCHAR(100) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    parent_space_id VARCHAR(100) NULL,  -- References parent's space_id, not id
    is_child_space BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_space_id) REFERENCES spaces(space_id) ON DELETE CASCADE
);

-- Space content table to store content within spaces
CREATE TABLE IF NOT EXISTS space_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content_id VARCHAR(100) UNIQUE NOT NULL,
    space_id VARCHAR(100) NOT NULL,
    type ENUM('notes', 'url', 'upload') NOT NULL,
    data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (space_id) REFERENCES spaces(space_id) ON DELETE CASCADE
);

-- Unified file uploads table to store metadata for all file uploads
-- NOTE: This table must be created AFTER space_content due to foreign key dependency
CREATE TABLE IF NOT EXISTS file_uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_id VARCHAR(100) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    content_id VARCHAR(100) NULL,  -- NULL for user-level uploads, populated for space content
    upload_context ENUM('user_profile', 'space_content') NOT NULL,
    upload_type ENUM('resume', 'profile_image', 'document', 'image', 'video', 'audio', 'code', 'other') NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_extension VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES space_content(content_id) ON DELETE CASCADE
);

-- Insert default card styles if not exists
INSERT IGNORE INTO card_styles (style_name, style_description, background_color, text_color) VALUES
('modern', 'Sleek dark theme perfect for tech professionals', '#161b22', '#f0f6fc'),
('minimal', 'Simple and professional white background', '#ffffff', '#2d3748'),
('gradient', 'Eye-catching gradient design that stands out', '#667eea', '#ffffff');

-- Update gradient style with gradient colors
UPDATE card_styles 
SET is_gradient = TRUE, gradient_start = '#667eea', gradient_end = '#764ba2' 
WHERE style_name = 'gradient';

-- Create indexes for better performance
-- Note: MySQL doesn't support IF NOT EXISTS for indexes
-- The setup script will handle this properly
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_cards_card_id ON cards(card_id);
CREATE INDEX idx_spaces_user_id ON spaces(user_id);
CREATE INDEX idx_spaces_parent_space_id ON spaces(parent_space_id);
CREATE INDEX idx_spaces_space_id ON spaces(space_id);
CREATE INDEX idx_space_content_space_id ON space_content(space_id);
CREATE INDEX idx_space_content_type ON space_content(type);
CREATE INDEX idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX idx_file_uploads_content_id ON file_uploads(content_id);
CREATE INDEX idx_file_uploads_context ON file_uploads(upload_context);

-- Create view for space hierarchy
CREATE OR REPLACE VIEW space_hierarchy AS
SELECT 
    s.id,
    s.space_id,
    s.name,
    s.description,
    s.color,
    s.user_id,
    s.parent_space_id,
    s.is_child_space,
    s.created_at,
    s.updated_at,
    p.name as parent_name,
    p.space_id as parent_space_id_ref,
    (SELECT COUNT(*) FROM spaces WHERE parent_space_id = s.space_id) AS child_spaces_count,
    (SELECT COUNT(*) FROM space_content WHERE space_id = s.space_id) AS content_count
FROM 
    spaces s
LEFT JOIN 
    spaces p ON s.parent_space_id = p.space_id;

-- Create view for card details
CREATE OR REPLACE VIEW card_details AS
SELECT 
    c.id,
    c.card_id,
    c.user_id,
    c.card_style_id,
    c.card_data,
    c.generated_at,
    c.is_active,
    cs.style_name,
    cs.style_description,
    cs.background_color,
    cs.text_color,
    cs.is_gradient,
    cs.gradient_start,
    cs.gradient_end,
    u.first_name,
    u.last_name,
    u.email,
    u.professional_title
FROM 
    cards c
JOIN 
    card_styles cs ON c.card_style_id = cs.id
JOIN 
    users u ON c.user_id = u.id;
