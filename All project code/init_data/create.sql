DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL
);

INSERT INTO users (username, password) VALUES ('admin','$2b$10$OobnoGdMm7qtw4mq5Eqv/Oxbf1NJECNpfbTBxyrakBB2AtvqEDRK6');
