package com.vmts;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/**
 * Entry point of the Vehicle Management & Tracking System REST API.
 *
 * Run with: mvn spring-boot:run   (MySQL, see application.properties)
 *       or: mvn spring-boot:run -Dspring-boot.run.profiles=test   (in-memory H2)
 */
@SpringBootApplication
@ConfigurationPropertiesScan
public class VmtsApplication {

  public static void main(String[] args) {
    SpringApplication.run(VmtsApplication.class, args);
  }
}
