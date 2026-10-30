package com.vmts.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

/** Latest known position of a vehicle (one row per vehicle). */
@Entity
@Table(name = "vehicle_locations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleLocation {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "vehicle_id", nullable = false, unique = true)
  private Vehicle vehicle;

  @Column(nullable = false)
  private Double latitude;

  @Column(nullable = false)
  private Double longitude;

  @Column(length = 160)
  private String place;

  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;
}
