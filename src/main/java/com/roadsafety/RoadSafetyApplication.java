package com.roadsafety;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class RoadSafetyApplication {
    public static void main(String[] args) {
        SpringApplication.run(RoadSafetyApplication.class, args);
        System.out.println("==========================================================");
        System.out.println("  ROAD SAFETY & HOSPITAL NOTIFICATION SYSTEM STARTED SUCCESS");
        System.out.println("  Web Application: http://localhost:8080");
        System.out.println("  H2 Console:      http://localhost:8080/h2-console");
        System.out.println("==========================================================");
    }
}
