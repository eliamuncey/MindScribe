DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
user_id SERIAL PRIMARY KEY,
username VARCHAR(50) NOT NULL,
password CHAR(60) NOT NULL
);

DROP TABLE IF EXISTS journals CASCADE;
CREATE TABLE journals(
journal_id SERIAL PRIMARY KEY,
journal_title TEXT,
journal_description TEXT,
user_id INT REFERENCES users(user_id),
auto_mood BOOLEAN DEFAULT FALSE
);

DROP TABLE IF EXISTS entries CASCADE;
CREATE TABLE entries(
entry_id SERIAL PRIMARY KEY,
user_id INT REFERENCES users(user_id),
entry_title TEXT,
date VARCHAR(20),
time VARCHAR(20),
raw_text TEXT,
formatted_text TEXT,
summary_text TEXT,
entry_mood INT,
journal_id INT REFERENCES journals(journal_id)
);