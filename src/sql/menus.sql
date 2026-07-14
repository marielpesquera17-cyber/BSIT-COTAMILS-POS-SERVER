-- Defines product categories displayed on the cashier menu grid
CREATE TABLE menu_categories (
    category_id   SERIAL PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL UNIQUE,
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coffee shop product catalog (beverages, food, desserts)
CREATE TABLE menu_items (
    item_id      SERIAL PRIMARY KEY,
    name         VARCHAR(150) NOT NULL,
    category_id  INTEGER NOT NULL REFERENCES menu_categories(category_id),
    description  TEXT,
    image_url    TEXT,
    is_active    BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores Hot/Iced/Regular/Slice/Piece variant pricing per item
CREATE TABLE menu_item_variants (
    variant_id   SERIAL PRIMARY KEY,
    item_id      INTEGER NOT NULL REFERENCES menu_items(item_id) ON DELETE CASCADE,
    label        VARCHAR(50) NOT NULL,
    price        NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    is_available BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);