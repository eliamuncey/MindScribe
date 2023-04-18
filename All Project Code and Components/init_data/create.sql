DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users(
username VARCHAR(50) PRIMARY KEY,
password CHAR(60) NOT NULL
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
entry_mood INT
);