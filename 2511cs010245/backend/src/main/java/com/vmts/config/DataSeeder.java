package com.vmts.config;

import com.vmts.model.*;
import com.vmts.repository.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Inserts the demo fleet on first start (only when the users table is empty and
 * vmts.seed.enabled=true). Mirrors the data the frontend used while it was mock-only.
 */
@Component
public class DataSeeder implements CommandLineRunner {

  private final UserRepository users;
  private final DriverRepository drivers;
  private final VehicleRepository vehicles;
  private final ServiceRecordRepository services;
  private final VehicleLocationRepository locations;
  private final AuditLogRepository auditLogs;
  private final PasswordEncoder passwordEncoder;

  @Value("${vmts.seed.enabled:true}")
  private boolean seedEnabled;

  public DataSeeder(
      UserRepository users,
      DriverRepository drivers,
      VehicleRepository vehicles,
      ServiceRecordRepository services,
      VehicleLocationRepository locations,
      AuditLogRepository auditLogs,
      PasswordEncoder passwordEncoder) {
    this.users = users;
    this.drivers = drivers;
    this.vehicles = vehicles;
    this.services = services;
    this.locations = locations;
    this.auditLogs = auditLogs;
    this.passwordEncoder = passwordEncoder;
  }

  private static LocalDateTime dt(String value) {
    return LocalDateTime.parse(value.replace(' ', 'T'));
  }

  @Override
  @Transactional
  public void run(String... args) {
    if (!seedEnabled || users.count() > 0) {
      return;
    }

    Driver d1 = driver("Suresh Reddy", "driver@vmts.com", "+91 98490 11223", "TS0120180012345",
        LicenseStatus.VALID, DriverStatus.ACTIVE, "2025-11-04", "2026-08-08 21:40");
    Driver d2 = driver("Anil Kumar", "anil.kumar@vmts.com", "+91 99590 44120", "TS0920190045612",
        LicenseStatus.VALID, DriverStatus.ACTIVE, "2025-12-12", "2026-08-08 18:05");
    Driver d3 = driver("Mahesh Naidu", "mahesh.naidu@vmts.com", "+91 90005 78123", "AP0920170098741",
        LicenseStatus.EXPIRING_SOON, DriverStatus.ACTIVE, "2026-01-20", "2026-08-07 09:12");
    Driver d4 = driver("Praveen Rao", "praveen.rao@vmts.com", "+91 91778 20034", "TS1020200011234",
        LicenseStatus.VALID, DriverStatus.ACTIVE, "2026-02-02", "2026-08-06 16:30");
    Driver d5 = driver("Imran Sheikh", "imran.sheikh@vmts.com", "+91 93910 55447", "TS0820160077412",
        LicenseStatus.VALID, DriverStatus.INACTIVE, "2026-03-15", "2026-07-28 11:00");
    Driver d6 = driver("Lakshmi Prasad", "lakshmi.prasad@vmts.com", "+91 98663 90021", "TS0720150033218",
        LicenseStatus.VALID, DriverStatus.ACTIVE, "2026-04-09", "2026-08-05 08:45");
    Driver d7 = driver("Venkat Rami Reddy", "venkat.reddy@vmts.com", "+91 94400 12876", "AP1620180066543",
        LicenseStatus.EXPIRED, DriverStatus.SUSPENDED, "2026-05-21", "2026-06-30 14:20");
    drivers.saveAll(java.util.List.of(d1, d2, d3, d4, d5, d6, d7));

    Vehicle v1 = vehicle("TS09AB1234", "Maruti Suzuki", "Swift", 2021, d1, VehicleStatus.ACTIVE,
        "2026-08-08 21:40", "2026-08-08 09:05", "Routine city duty.");
    Vehicle v2 = vehicle("TS08CD4521", "Tata Motors", "Nexon", 2022, d2, VehicleStatus.ACTIVE,
        "2026-08-08 18:05", "2026-08-08 08:20", "");
    Vehicle v3 = vehicle("AP09EF7821", "Mahindra", "Bolero", 2019, d3, VehicleStatus.MAINTENANCE,
        "2026-08-07 09:12", "2026-08-05 07:50", "Brake inspection pending at depot workshop.");
    Vehicle v4 = vehicle("TS10GH9034", "Toyota", "Innova Crysta", 2023, d4, VehicleStatus.ACTIVE,
        "2026-08-06 16:30", "2026-08-06 07:15", "");
    Vehicle v5 = vehicle("TS07JK5590", "Ashok Leyland", "Dost+", 2020, d5, VehicleStatus.INACTIVE,
        "2026-07-28 11:00", "2026-07-27 06:40", "Off-road, awaiting driver reassignment.");
    Vehicle v6 = vehicle("TS11LM3345", "Hyundai", "Creta", 2022, null, VehicleStatus.ACTIVE,
        "2026-08-04 13:25", null, "");
    Vehicle v7 = vehicle("AP16NP8812", "Tata Motors", "Ace Gold", 2018, null, VehicleStatus.MAINTENANCE,
        "2026-08-02 10:10", null, "Engine service in progress.");
    vehicles.saveAll(java.util.List.of(v1, v2, v3, v4, v5, v6, v7));

    users.save(User.builder()
        .name("R. Kulkarni")
        .email("admin@vmts.com")
        .passwordHash(passwordEncoder.encode("admin123"))
        .role(Role.ADMIN)
        .build());
    users.save(User.builder()
        .name("Suresh Reddy")
        .email("driver@vmts.com")
        .passwordHash(passwordEncoder.encode("driver123"))
        .role(Role.DRIVER)
        .driver(d1)
        .build());

    services.saveAll(java.util.List.of(
        service(v1, "Oil Change", "2026-05-10", "2026-08-10",
            "Engine oil and filter replacement.", ServiceStatus.DUE_SOON, "2026-05-10", "2026-08-01"),
        service(v2, "General Service", "2026-05-14", "2026-08-14",
            "Periodic 20,000 km general service.", ServiceStatus.SCHEDULED, "2026-05-14", "2026-07-30"),
        service(v3, "Brake Inspection", "2026-05-05", "2026-08-05",
            "Front brake pad wear reported by driver.", ServiceStatus.OVERDUE, "2026-05-05", "2026-08-06"),
        service(v4, "Tyre Rotation", "2026-06-18", "2026-09-18",
            "Rotation and pressure check for all four tyres.", ServiceStatus.SCHEDULED, "2026-06-18", "2026-06-18"),
        service(v5, "Battery Replacement", "2026-04-22", "2026-08-12",
            "Battery replaced with 65Ah unit.", ServiceStatus.DUE_SOON, "2026-04-22", "2026-08-01"),
        service(v6, "Air Filter Replacement", "2026-07-01", "2026-10-01",
            "Cabin and engine air filter replaced.", ServiceStatus.COMPLETED, "2026-07-01", "2026-07-01"),
        service(v7, "Engine Service", "2026-07-25", "2026-08-04",
            "Engine overheating complaint under inspection.", ServiceStatus.OVERDUE, "2026-07-25", "2026-08-06"),
        service(v1, "Wheel Alignment", "2026-03-11", "2026-09-11",
            "Alignment and balancing completed.", ServiceStatus.COMPLETED, "2026-03-11", "2026-03-11"),
        service(v2, "AC Service", "2026-04-02", "2026-10-02",
            "Coolant top-up and blower cleaning.", ServiceStatus.COMPLETED, "2026-04-02", "2026-04-02"),
        service(v4, "Insurance Renewal Check", "2026-06-30", "2026-08-16",
            "Verify policy documents before renewal.", ServiceStatus.DUE_SOON, "2026-06-30", "2026-08-02"),
        service(v3, "Clutch Adjustment", "2026-02-14", "2026-08-14",
            "Clutch play adjusted during last workshop visit.", ServiceStatus.SCHEDULED, "2026-02-14", "2026-07-20"),
        service(v6, "Suspension Check", "2026-07-12", "2026-11-12",
            "Rear suspension noise inspected, no fault found.", ServiceStatus.COMPLETED, "2026-07-12", "2026-07-12")));

    locations.saveAll(java.util.List.of(
        location(v1, 17.3850, 78.4867, "Abids, Hyderabad", "2026-08-08 22:30"),
        location(v2, 17.4483, 78.3915, "Hitec City, Hyderabad", "2026-08-08 21:10"),
        location(v3, 16.5062, 80.6480, "Vijayawada Depot", "2026-08-07 09:12"),
        location(v4, 17.4239, 78.4738, "Begumpet, Hyderabad", "2026-08-08 20:02"),
        location(v5, 17.3616, 78.4747, "Charminar, Hyderabad", "2026-07-28 11:00"),
        location(v6, 17.4933, 78.3915, "Kompally, Hyderabad", "2026-08-04 13:25"),
        location(v7, 16.3067, 80.4365, "Guntur Workshop", "2026-08-02 10:10")));

    auditLogs.saveAll(java.util.List.of(
        audit("R. Kulkarni", Role.ADMIN, "Created", "Vehicle", "TS11LM3345", "2026-08-08 22:25"),
        audit("Suresh Reddy", Role.DRIVER, "Started Vehicle", "Vehicle", "TS09AB1234", "2026-08-08 22:12"),
        audit("R. Kulkarni", Role.ADMIN, "Updated", "Driver", "Mahesh Naidu", "2026-08-08 21:58"),
        audit("Anil Kumar", Role.DRIVER, "Updated", "Vehicle", "TS08CD4521", "2026-08-08 18:05"),
        audit("R. Kulkarni", Role.ADMIN, "Created", "Service", "TS10GH9034 / Insurance Renewal Check", "2026-08-08 16:40"),
        audit("R. Kulkarni", Role.ADMIN, "Deleted", "Service", "TS07JK5590 / Duplicate entry", "2026-08-08 15:02"),
        audit("Mahesh Naidu", Role.DRIVER, "Started Vehicle", "Vehicle", "AP09EF7821", "2026-08-07 07:50"),
        audit("R. Kulkarni", Role.ADMIN, "Updated", "Vehicle", "AP16NP8812", "2026-08-06 19:30"),
        audit("Praveen Rao", Role.DRIVER, "Updated", "Vehicle", "TS10GH9034", "2026-08-06 16:30"),
        audit("R. Kulkarni", Role.ADMIN, "Created", "Driver", "Lakshmi Prasad", "2026-08-05 10:15"),
        audit("R. Kulkarni", Role.ADMIN, "Updated", "Service", "TS09AB1234 / Oil Change", "2026-08-04 11:45"),
        audit("Imran Sheikh", Role.DRIVER, "Updated", "Vehicle", "TS07JK5590", "2026-07-28 11:00"),
        audit("R. Kulkarni", Role.ADMIN, "Deleted", "Driver", "Temporary account", "2026-07-26 09:20"),
        audit("R. Kulkarni", Role.ADMIN, "Created", "Vehicle", "AP16NP8812", "2026-07-20 14:05")));
  }

  private Driver driver(String name, String email, String phone, String license,
      LicenseStatus licenseStatus, DriverStatus status, String createdAt, String lastActivity) {
    return Driver.builder()
        .name(name)
        .email(email)
        .phone(phone)
        .licenseNumber(license)
        .licenseStatus(licenseStatus)
        .status(status)
        .createdAt(LocalDate.parse(createdAt))
        .lastActivity(dt(lastActivity))
        .build();
  }

  private Vehicle vehicle(String reg, String manufacturer, String model, int year, Driver driver,
      VehicleStatus status, String lastUpdated, String lastStartAt, String remarks) {
    return Vehicle.builder()
        .registrationNumber(reg)
        .manufacturer(manufacturer)
        .model(model)
        .year(year)
        .driver(driver)
        .status(status)
        .lastUpdated(dt(lastUpdated))
        .lastStartAt(lastStartAt == null ? null : dt(lastStartAt))
        .remarks(remarks)
        .build();
  }

  private ServiceRecord service(Vehicle vehicle, String type, String date, String nextDate,
      String description, ServiceStatus status, String createdAt, String updatedAt) {
    return ServiceRecord.builder()
        .vehicle(vehicle)
        .serviceType(type)
        .serviceDate(LocalDate.parse(date))
        .nextServiceDate(LocalDate.parse(nextDate))
        .description(description)
        .status(status)
        .createdAt(LocalDate.parse(createdAt))
        .updatedAt(LocalDate.parse(updatedAt))
        .build();
  }

  private VehicleLocation location(Vehicle vehicle, double lat, double lng, String place, String updatedAt) {
    return VehicleLocation.builder()
        .vehicle(vehicle)
        .latitude(lat)
        .longitude(lng)
        .place(place)
        .updatedAt(dt(updatedAt))
        .build();
  }

  private AuditLog audit(String user, Role role, String action, String entity, String reference, String timestamp) {
    return AuditLog.builder()
        .userName(user)
        .role(role)
        .action(action)
        .entity(entity)
        .reference(reference)
        .timestamp(dt(timestamp))
        .build();
  }
}
