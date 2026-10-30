package com.logistics;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.logistics.model.*;
import com.logistics.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * Entry point for the Transportation & Logistics Management System.
 * Run with: mvn spring-boot:run
 * API will be available at http://localhost:8080/api/...
 * H2 console (dev database viewer) at http://localhost:8080/h2-console
 */
@SpringBootApplication
public class LogisticsApplication {

    public static void main(String[] args) {
        SpringApplication.run(LogisticsApplication.class, args);
    }

    // Seeds the database with sample data on startup so the frontend has something to show immediately.
    @Bean
    CommandLineRunner seedData(VehicleRepository vehicleRepo, DriverRepository driverRepo,
            ShipmentRepository shipmentRepo, UserRepository userRepo, PasswordEncoder passwordEncoder,
            JdbcTemplate jdbcTemplate, PlatformTransactionManager transactionManager) {
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS app_initialization (
                    name VARCHAR(50) PRIMARY KEY
                )
                """);

        return args -> new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
            if (jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM app_initialization WHERE name = ?",
                    Integer.class, "initial-data") > 0) {
                return;
            }

            boolean hasExistingData = vehicleRepo.count() > 0
                    || driverRepo.count() > 0
                    || shipmentRepo.count() > 0
                    || userRepo.count() > 0;

            if (!hasExistingData) {
                Vehicle v1 = vehicleRepo.save(new Vehicle("TN-01-AB-1234", Vehicle.VehicleType.TRUCK, 5000, Vehicle.Status.AVAILABLE));
                Vehicle v2 = vehicleRepo.save(new Vehicle("TN-02-CD-5678", Vehicle.VehicleType.VAN, 1200, Vehicle.Status.AVAILABLE));
                vehicleRepo.save(new Vehicle("TN-03-EF-9012", Vehicle.VehicleType.BIKE, 20, Vehicle.Status.MAINTENANCE));

                Driver d1 = driverRepo.save(new Driver("Arun Kumar", "DL-88291", "9876543210", Driver.Status.AVAILABLE));
                Driver d2 = driverRepo.save(new Driver("Priya Singh", "DL-33021", "9123456780", Driver.Status.AVAILABLE));

                Shipment s1 = new Shipment("Chennai", "Bengaluru", "Ravi Traders", 450.5, Shipment.Status.IN_TRANSIT);
                s1.setVehicle(v1);
                s1.setDriver(d1);
                shipmentRepo.save(s1);

                Shipment s2 = new Shipment("Coimbatore", "Madurai", "Global Textiles", 120.0, Shipment.Status.PENDING);
                shipmentRepo.save(s2);

                Shipment s3 = new Shipment("Chennai", "Hyderabad", "TechParts Ltd", 80.0, Shipment.Status.DELIVERED);
                s3.setVehicle(v2);
                s3.setDriver(d2);
                shipmentRepo.save(s3);

                userRepo.save(new User("admin", passwordEncoder.encode("admin123"), "ADMIN"));
                userRepo.save(new User("staff", passwordEncoder.encode("staff123"), "STAFF"));
            }

            jdbcTemplate.update("INSERT INTO app_initialization (name) VALUES (?)", "initial-data");
        });
    }
}
