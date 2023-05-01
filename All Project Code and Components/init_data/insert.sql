INSERT INTO users (username, password) VALUES
('John', '$2b$10$DOhXgcmjbgWkRziT3HvWTOXi/hj7jfK4dKhL80jKEfm9JBGgLCQ8q'),
('Blake', '$2b$10$DOhXgcmjbgWkRziT3HvWTOXi/hj7jfK4dKhL80jKEfm9JBGgLCQ8q'),
('Ryan', '$2b$10$DOhXgcmjbgWkRziT3HvWTOXi/hj7jfK4dKhL80jKEfm9JBGgLCQ8q'),
('Elia', '$2b$10$DOhXgcmjbgWkRziT3HvWTOXi/hj7jfK4dKhL80jKEfm9JBGgLCQ8q'),
('Jared', '$2b$10$DOhXgcmjbgWkRziT3HvWTOXi/hj7jfK4dKhL80jKEfm9JBGgLCQ8q');

INSERT INTO journals (journal_title, journal_description, user_id) VALUES
('Daily Journal', 'Random Thoughts', 1),
('Daily Journal', 'Random Thoughts', 2),
('Daily Journal', 'Random Thoughts', 3),
('Daily Journal', 'Random Thoughts', 4),
('Daily Journal', 'Random Thoughts', 5),
('To-Do', 'Unfinished Tasks', 1),
('To-Do', 'Unfinished Tasks', 2),
('To-Do', 'Unfinished Tasks', 3),
('To-Do', 'Unfinished Tasks', 4),
('To-Do', 'Unfinished Tasks', 5);

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
