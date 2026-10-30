package com.smartvillage;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SmartVillageApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartVillageApplication.class, args);
        System.out.println("\n=======================================================");
        System.out.println("  Smart Village Management System started successfully!");
        System.out.println("  Access Web Application at: http://localhost:8081");
        System.out.println("=======================================================\n");
    }
}
