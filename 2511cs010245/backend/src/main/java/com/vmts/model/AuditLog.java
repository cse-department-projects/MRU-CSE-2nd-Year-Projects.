package com.vmts.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_name", nullable = false, length = 120)
  private String userName;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Role role;

  @Column(nullable = false, length = 40)
  private String action;

  @Column(nullable = false, length = 40)
  private String entity;

  @Column(nullable = false, length = 200)
  private String reference;

  @Column(nullable = false)
  private LocalDateTime timestamp;
}
