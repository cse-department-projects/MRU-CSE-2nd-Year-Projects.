package com.vmts.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.*;

@Entity
@Table(name = "service_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRecord {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "vehicle_id", nullable = false)
  private Vehicle vehicle;

  @Column(name = "service_type", nullable = false, length = 80)
  private String serviceType;

  @Column(name = "service_date", nullable = false)
  private LocalDate serviceDate;

  @Column(name = "next_service_date", nullable = false)
  private LocalDate nextServiceDate;

  @Column(length = 500)
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private ServiceStatus status;

  @Column(name = "created_at", nullable = false)
  private LocalDate createdAt;

  @Column(name = "updated_at", nullable = false)
  private LocalDate updatedAt;
}
