-- Defines inventory category groupings (Cups & Packaging, Coffee & Tea, Dairy, etc.)
CREATE TABLE inventory_categories (
    category_id   SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores supply/stock items tracked at the coffee shop
CREATE TABLE inventory_items (
    item_id        SERIAL PRIMARY KEY,
    name           VARCHAR(150) NOT NULL,
    category_id    INTEGER NOT NULL REFERENCES inventory_categories(category_id),
    current_stock  NUMERIC(12,3) DEFAULT 0 CHECK (current_stock >= 0),
    unit           VARCHAR(20) NOT NULL,
    reorder_level  NUMERIC(12,3) DEFAULT 0,
    last_restocked TIMESTAMP,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock movement history — restocks, deductions, adjustments
CREATE TABLE inventory_transactions (
    transaction_id SERIAL PRIMARY KEY,
    item_id        INTEGER NOT NULL REFERENCES inventory_items(item_id),
    staff_id       INTEGER REFERENCES staff(staff_id),
    type           VARCHAR(20) NOT NULL
                       CHECK (type IN ('stock_in','stock_out','adjustment')),
    quantity       NUMERIC(12,3) NOT NULL,
    note           TEXT,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);