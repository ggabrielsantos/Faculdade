CREATE DATABASE IF NOT EXISTS petshop CHARACTER SET utf8mb4;
USE petshop;

CREATE TABLE IF NOT EXISTS pet (
  codigo_pet INT AUTO_INCREMENT PRIMARY KEY,
  nome_pet   VARCHAR(100) NOT NULL,
  genero_pet CHAR(1)      NOT NULL,           -- 'M' ou 'F'
  excluido   TINYINT(1)   NOT NULL DEFAULT 0  -- 1 = excluído logicamente
);
