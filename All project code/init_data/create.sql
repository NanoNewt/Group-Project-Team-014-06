-- Drop tables if they exist
DROP TABLE IF EXISTS user_to_books CASCADE;
DROP TABLE IF EXISTS user_to_annotation CASCADE;
DROP TABLE IF EXISTS books_to_annotation CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS annotations;
DROP TABLE IF EXISTS book_pages;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS cnotes;



-- Create the users table
CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL
);

-- Create the books table
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    genre VARCHAR(255),
    pages_in_book INT,
    description TEXT
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

-- Create the cnotes table
CREATE TABLE IF NOT EXISTS cnotes (
    course_id SERIAL,
    title TEXT NOT NULL,
    content TEXT NOT NULL
);

INSERT INTO cnotes (course_id, title, content) VALUES ('2400','Bomb Lab','The nefarious Dr. Evil has planted a slew of “binary bombs” on our class machines. A binary bomb is a program that consists of a sequence of phases. Each phase expects you to type a particular string on stdin. If you type the correct string, then the phase is defused and the bomb proceeds to the next phase. Otherwise, the bomb explodes by printing "BOOM!!!" and then terminating. The bomb is defused when every phase has been defused.

There are too many bombs for us to deal with, so we are giving each student a bomb to defuse. Your mission, which you have no choice but to accept, is to defuse your bomb before the due date. Good luck, and welcome to the bomb squad!
');
INSERT INTO cnotes (course_id, title, content) VALUES ('2400','Attack Lab','In this lab, you will gain firsthand experience with methods used to exploit security weaknesses in
operating systems and network servers. Our purpose is to help you learn about the runtime operation of
programs and to understand the nature of these security weaknesses so that you can avoid them when you
write system code. We do not condone the use of any other form of attack to gain unauthorized access to
any system resources.
');
INSERT INTO cnotes (course_id, title, content) VALUES ('2400','Data Lab','The purpose of this assignment is to become more familiar with bit-level representations of integers (and floating point) numbers. You will do this by solving a series of programming ``puzzles.'' Some of these puzzles are quite artificial, but you will find yourself thinking much more about bits in working your way through them.
');

INSERT INTO users (username, password) VALUES ('test','test'); --lab 11
INSERT INTO users (username, password) VALUES ('admin','$2b$10$OobnoGdMm7qtw4mq5Eqv/Oxbf1NJECNpfbTBxyrakBB2AtvqEDRK6'); --lab 11
