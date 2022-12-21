DROP TABLE IF EXISTS reviews CASCADE;
CREATE TABLE reviews
(
    review_id   SERIAL PRIMARY KEY NOT NULL,
    brewery_name VARCHAR(100),
    review  VARCHAR(1000),
    reviewDate VARCHAR(1000)
);