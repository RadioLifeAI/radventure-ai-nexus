-- Adicionar valor 'daily_challenge' ao enum radcoin_tx_type
ALTER TYPE radcoin_tx_type ADD VALUE IF NOT EXISTS 'daily_challenge';