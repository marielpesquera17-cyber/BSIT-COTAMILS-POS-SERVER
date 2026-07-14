-- Stores the active in-session cart per cashier terminal
CREATE TABLE carts (
    cart_id    SERIAL PRIMARY KEY,
    staff_id   INTEGER NOT NULL REFERENCES staff(staff_id),
    order_type VARCHAR(20) DEFAULT 'Dine In'
                   CHECK (order_type IN ('Dine In','Take Out')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores individual items inside an active cart, including selected variant
CREATE TABLE cart_items (
    cart_item_id SERIAL PRIMARY KEY,
    cart_id      INTEGER NOT NULL REFERENCES carts(cart_id) ON DELETE CASCADE,
    item_id      INTEGER NOT NULL REFERENCES menu_items(item_id),
    variant_id   INTEGER NOT NULL REFERENCES menu_item_variants(variant_id),
    quantity     INTEGER NOT NULL DEFAULT 1,
    unit_price   NUMERIC(10,2) NOT NULL,
    subtotal     NUMERIC(10,2) NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);