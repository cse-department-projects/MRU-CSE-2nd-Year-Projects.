package com.vmts.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "vehicles", uniqueConstraints = @UniqueConstraint(columnNames = "registration_number"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "registration_number", nullable = false, length = 20)
  private String registrationNumber;

  @Column(nullable = false, length = 80)
  private String manufacturer;

  @Column(nullable = false, length = 80)
  private String model;

  @Column(name = "manufacture_year", nullable = false)
  private Integer year;

  /** One driver can be assigned to at most one vehicle. */
  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "driver_id", unique = true)
  private Driver driver;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private VehicleStatus status;

  @Column(name = "last_updated", nullable = false)
  private LocalDateTime lastUpdated;

  @Column(name = "last_start_at")
  private LocalDateTime lastStartAt;

  @Column(length = 500)
  private String remarks;
}
