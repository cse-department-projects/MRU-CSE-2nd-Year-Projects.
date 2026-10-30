-- Run once in MySQL before starting the backend (optional: the JDBC URL also
-- uses createDatabaseIfNotExist=true). Tables are created automatically by
-- Hibernate (spring.jpa.hibernate.ddl-auto=update) and demo rows are inserted
-- by com.vmts.config.DataSeeder on first start.

CREATE DATABASE IF NOT EXISTS vmts_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Optional dedicated user:
-- CREATE USER 'vmts'@'localhost' IDENTIFIED BY 'vmts_password';
-- GRANT ALL PRIVILEGES ON vmts_db.* TO 'vmts'@'localhost';
-- FLUSH PRIVILEGES;

-- Resulting tables (for reference):
--   users, drivers, vehicles, service_records, vehicle_locations, audit_logs
