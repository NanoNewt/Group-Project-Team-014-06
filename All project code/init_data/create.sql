-- Drop tables if they exist
DROP TABLE IF EXISTS user_to_books CASCADE;
DROP TABLE IF EXISTS user_to_comments CASCADE;
DROP TABLE IF EXISTS books_to_comments CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create the users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    major VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL
);

-- Create the user_to_books table
CREATE TABLE user_to_books (
    user_id INT REFERENCES users(id),
    book_id INT REFERENCES books(id),
    PRIMARY KEY(user_id, book_id)
);

-- Create the user_to_comments table
CREATE TABLE user_to_comments (
    user_id INT REFERENCES users(id),
    comment_id INT REFERENCES comments(id),
    PRIMARY KEY(user_id, comment_id)
);

-- Create the books_to_comments table
CREATE TABLE books_to_comments (
    book_id INT REFERENCES books(id),
    comment_id INT REFERENCES comments(id),
    PRIMARY KEY(book_id, comment_id)
);

-- Create the books table
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(255) NOT NULL,
    description TEXT NOT NULL
);

-- Create the comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    book_id INT REFERENCES books(id),
    user_id VARCHAR(50) REFERENCES users(username),
    comment TEXT NOT NULL
);

INSERT INTO users (username, password) VALUES ('admin','$2b$10$OobnoGdMm7qtw4mq5Eqv/Oxbf1NJECNpfbTBxyrakBB2AtvqEDRK6');
