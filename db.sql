CREATE DATABASE proyecto1_BackEnd;
USE proyecto1_BackEnd;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL
);