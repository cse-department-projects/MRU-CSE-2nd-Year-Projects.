package com.vmts.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "drivers", uniqueConstraints = {
    @UniqueConstraint(columnNames = "email"),
    @UniqueConstraint(columnNames = "license_number")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Driver {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 120)
  private String name;

  @Column(nullable = false, length = 160)
  private String email;

  @Column(nullable = false, length = 30)
  private String phone;

  @Column(name = "license_number", nullable = false, length = 40)
  private String licenseNumber;

  @Enumerated(EnumType.STRING)
  @Column(name = "license_status", nullable = false, length = 20)
  private LicenseStatus licenseStatus;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private DriverStatus status;

  /** The vehicle currently assigned to this driver (owning side is Vehicle.driver). */
  @OneToOne(mappedBy = "driver", fetch = FetchType.LAZY)
  private Vehicle vehicle;

  @Column(name = "created_at", nullable = false)
  private LocalDate createdAt;

  @Column(name = "last_activity", nullable = false)
  private LocalDateTime lastActivity;
}
