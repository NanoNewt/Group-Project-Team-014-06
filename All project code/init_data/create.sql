-- Drop tables if they exist
DROP TABLE IF EXISTS user_to_books CASCADE;
DROP TABLE IF EXISTS user_to_annotation CASCADE;
DROP TABLE IF EXISTS books_to_annotation CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS annotations;
DROP TABLE IF EXISTS book_pages;

-- Create the users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password CHAR(60) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    major VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL
);

-- Create the books table
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(255) NOT NULL,
    description TEXT NOT NULL
);


-- Create the book_pages table
CREATE TABLE book_pages (
    id SERIAL PRIMARY KEY,
    book_id INT REFERENCES books(id),
    page_number INT NOT NULL,
    page_content TEXT NOT NULL
);

-- Create the annotations table
CREATE TABLE annotations (
    id SERIAL PRIMARY KEY,
    book_id INT REFERENCES books(id),
    page_number INT NOT NULL,
    start_index INT NOT NULL,
    end_index INT NOT NULL,
    comment TEXT NOT NULL
);

-- Create the user_to_books table
CREATE TABLE user_to_books (
    user_id INT REFERENCES users(id),
    book_id INT REFERENCES books(id),
    PRIMARY KEY(user_id, book_id)
);

-- Create the user_to_annotation table
CREATE TABLE user_to_annotation (
    user_id INT REFERENCES users(id),
    annotation_id INT REFERENCES annotations(id),
    PRIMARY KEY(user_id, annotation_id)
);

-- Create the books_to_annotation table
CREATE TABLE books_to_annotation (
    book_id INT REFERENCES books(id),
    annotation_id INT REFERENCES annotations(id),
    PRIMARY KEY(book_id, annotation_id)
);



INSERT INTO users (username, password, first_name, last_name, email, year, major,degree) VALUES ('admin','$2b$10$OobnoGdMm7qtw4mq5Eqv/Oxbf1NJECNpfbTBxyrakBB2AtvqEDRK6','test','test','test','2023','math','junior');