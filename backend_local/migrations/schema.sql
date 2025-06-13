-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    wallet_address VARCHAR(42) PRIMARY KEY,
    username VARCHAR(30),
    email VARCHAR(100)
);

-- Crear tabla de cartas
CREATE TABLE IF NOT EXISTS cards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    card_id VARCHAR(50) NOT NULL,
    edition VARCHAR(100),
    user_wallet VARCHAR(42) REFERENCES users(wallet_address),
    url TEXT,
    market_value DECIMAL(10,2),
    in_pool BOOLEAN DEFAULT FALSE
);

-- Crear tabla de transacciones
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_wallet VARCHAR(42) REFERENCES users(wallet_address),
    transaction_type VARCHAR(10),
    card_id INTEGER REFERENCES cards(id) NOT NULL,
    amount DECIMAL(12,2),
    stablecoins_involved DECIMAL(12,2),
    commission DECIMAL(8,2) DEFAULT 0,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);