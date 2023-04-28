DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
username VARCHAR(50) PRIMARY KEY,
user_id SERIAL,
password CHAR(60) NOT NULL
);

DROP TABLE IF EXISTS journals CASCADE;
CREATE TABLE journals(
journal_id SERIAL PRIMARY KEY,
journal_title TEXT,
journal_description TEXT,
username VARCHAR(50) REFERENCES users(username)
);

DROP TABLE IF EXISTS entries CASCADE;
CREATE TABLE entries(
entry_id SERIAL PRIMARY KEY,
username VARCHAR(50) REFERENCES users (username),
entry_title TEXT,
entry_date DATE,
raw_text TEXT,
formatted_text TEXT,
summary_text TEXT,
entry_mood INT,
journal_id INT REFERENCES journals(journal_id)
);