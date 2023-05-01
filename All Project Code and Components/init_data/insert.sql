INSERT INTO users (username, password) VALUES
('John', '$2b$10$DOhXgcmjbgWkRziT3HvWTOXi/hj7jfK4dKhL80jKEfm9JBGgLCQ8q'),
('Blake', '$2b$10$DOhXgcmjbgWkRziT3HvWTOXi/hj7jfK4dKhL80jKEfm9JBGgLCQ8q'),
('Ryan', '$2b$10$DOhXgcmjbgWkRziT3HvWTOXi/hj7jfK4dKhL80jKEfm9JBGgLCQ8q'),
('Elia', '$2b$10$DOhXgcmjbgWkRziT3HvWTOXi/hj7jfK4dKhL80jKEfm9JBGgLCQ8q'),
('Jared', '$2b$10$DOhXgcmjbgWkRziT3HvWTOXi/hj7jfK4dKhL80jKEfm9JBGgLCQ8q');

INSERT INTO journals (journal_title, journal_description, color, user_id) VALUES
('Daily Journal', 'Random Thoughts', 'red', 1),
('Daily Journal', 'Random Thoughts', 'red', 2),
('Daily Journal', 'Random Thoughts', 'red', 3),
('Daily Journal', 'Random Thoughts', 'red', 4),
('Daily Journal', 'Random Thoughts', 'red', 5),
('To-Do', 'Unfinished Tasks', 'blue', 1),
('To-Do', 'Unfinished Tasks', 'blue', 2),
('To-Do', 'Unfinished Tasks', 'blue', 3),
('To-Do', 'Unfinished Tasks', 'blue', 4),
('To-Do', 'Unfinished Tasks', 'blue', 5);

INSERT INTO entries (entry_title, date, raw_text, journal_id, user_id) VALUES
('Almost Summer!', '04/30/2023', 'I can''t believe the semester is almost over!', 1, 1),
('Almost Summer!', '04/30/2023', 'I can''t believe the semester is almost over!', 2, 2),
('Almost Summer!', '04/30/2023', 'I can''t believe the semester is almost over!', 3, 3),
('Almost Summer!', '04/30/2023', 'I can''t believe the semester is almost over!', 4, 4),
('Almost Summer!', '04/30/2023', 'I can''t believe the semester is almost over!', 5, 5),
('Homework', '04/30/2023', 'Remember to work on the software dev project.', 6, 1),
('Homework', '04/30/2023', 'Remember to work on the software dev project.', 7, 2),
('Homework', '04/30/2023', 'Remember to work on the software dev project.', 8, 3),
('Homework', '04/30/2023', 'Remember to work on the software dev project.', 9, 4),
('Homework', '04/30/2023', 'Remember to work on the software dev project.', 10, 5);
