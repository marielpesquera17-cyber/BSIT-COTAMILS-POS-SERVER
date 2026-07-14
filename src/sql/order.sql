-- Master table for all completed and refunded POS orders
CREATE TABLE orders (
    order_id     SERIAL PRIMARY KEY,
    order_number SERIAL UNIQUE,
    staff_id     INTEGER REFERENCES staff(staff_id),
    order_type   VARCHAR(20) NOT NULL
                     CHECK (order_type IN ('Dine In','Take Out')),
    status       VARCHAR(20) DEFAULT 'Completed'
                     CHECK (status IN ('Pending','Completed','Refunded','Cancelled')),
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Line items for each order — snapshot of name, variant, and price at time of sale
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id      INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    item_id       INTEGER REFERENCES menu_items(item_id),
    variant_id    INTEGER REFERENCES menu_item_variants(variant_id),
    item_name     VARCHAR(150) NOT NULL,
    variant_label VARCHAR(50) NOT NULL,
    unit_price    NUMERIC(10,2) NOT NULL,
    quantity      INTEGER NOT NULL CHECK (quantity > 0),
    subtotal      NUMERIC(12,2) NOT NULL
);

-- Tracks status transition history per order (Completed → Refunded, etc.)
CREATE TABLE order_status_logs (
    status_log_id SERIAL PRIMARY KEY,
    order_id      INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    status        VARCHAR(20) NOT NULL,
    changed_by    INTEGER REFERENCES staff(staff_id),
    reason        TEXT,
    notes         TEXT,
    changed_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Records payment method, amount received, and change per order
CREATE TABLE order_payments (
    payment_id      SERIAL PRIMARY KEY,
    order_id        INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    payment_method  VARCHAR(20) NOT NULL
                        CHECK (payment_method IN ('Cash','Card','GCash')),
    amount_received NUMERIC(12,2),
    change_amount   NUMERIC(12,2),
    payment_status  VARCHAR(20) DEFAULT 'Paid'
                        CHECK (payment_status IN ('Paid','Failed','Refunded')),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores refund actions and reasons per order — Manager role only
CREATE TABLE order_refunds (
    refund_id       SERIAL PRIMARY KEY,
    order_id        INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    refunded_by     INTEGER NOT NULL REFERENCES staff(staff_id),
    reason          TEXT NOT NULL,
    refunded_amount NUMERIC(12,2) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);