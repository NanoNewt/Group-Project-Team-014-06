-- Drop tables if they exist
DROP TABLE IF EXISTS user_to_books CASCADE;
DROP TABLE IF EXISTS user_to_annotation CASCADE;
DROP TABLE IF EXISTS books_to_annotation CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS annotations;
DROP TABLE IF EXISTS book_pages;
DROP TABLE IF EXISTS comments;


-- Create the users table
CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL
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
    end_index INT NOT NULL
);

-- Create the comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) REFERENCES users(username),
    annotation_id INT REFERENCES annotations(id),
    comment TEXT NOT NULL
);

-- Create the annotation_to_comments table
CREATE TABLE annotation_to_comments (
    annotation_id INT REFERENCES annotations(id),
    comment_id INT REFERENCES comments(id)
);

-- Create the user_to_books table
CREATE TABLE user_to_books (
    username VARCHAR(50) REFERENCES users(username),
    book_id INT REFERENCES books(id),
    PRIMARY KEY(username, book_id)
);

-- Create the user_to_annotation table
CREATE TABLE user_to_annotation (
    username VARCHAR(50) REFERENCES users(username),
    annotation_id INT REFERENCES annotations(id),
    PRIMARY KEY(username, annotation_id)
);

-- Create the books_to_annotation table
CREATE TABLE books_to_annotation (
    book_id INT REFERENCES books(id),
    annotation_id INT REFERENCES annotations(id),
    PRIMARY KEY(book_id, annotation_id)
);



INSERT INTO users (username, password) VALUES ('test','test');
INSERT INTO users (username, password) VALUES ('admin','$2b$10$OobnoGdMm7qtw4mq5Eqv/Oxbf1NJECNpfbTBxyrakBB2AtvqEDRK6');
INSERT INTO books (id, title, author, genre, description) VALUES (1513,'Romeo and Juliet','William Shakespeare','?','description');
INSERT INTO book_pages (book_id, page_number, page_content) VALUES ('1513',1,'The Project Gutenberg eBook of Romeo and Juliet, by William Shakespeare

This eBook is for the use of anyone anywhere in the United States and
most other parts of the world at no cost and with almost no restrictions
whatsoever. You may copy it, give it away or re-use it under the terms
of the Project Gutenberg License included with this eBook or online at
www.gutenberg.org. If you are not located in the United States, you
will have to check the laws of the country where you are located before
using this eBook.

Title: Romeo and Juliet

Author: William Shakespeare

Release Date: November, 1998 [eBook #1513]
[Most recently updated: May 11, 2022]

Language: English

Character set encoding: UTF-8

Produced by: the PG Shakespeare Team, a team of about twenty Project Gutenberg volunteers.

*** START OF THE PROJECT GUTENBERG EBOOK ROMEO AND JULIET ***




THE TRAGEDY OF ROMEO AND JULIET



by William Shakespeare


Contents

THE PROLOGUE.

ACT I
Scene I. A public place.
Scene II. A Street.
Scene III. Room in Capulet’s House.
Scene IV. A Street.
Scene V. A Hall in Capulet’s House.


ACT II
CHORUS.
Scene I. An open place adjoining Capulet’s Garden.
Scene II. Capulet’s Garden.
Scene III. Friar Lawrence’s Cell.
Scene IV. A Street.
Scene V. Capulet’s Garden.
Scene VI. Friar Lawrence’s Cell.


ACT III
Scene I. A public Place.
Scene II. A Room in Capulet’s House.');
