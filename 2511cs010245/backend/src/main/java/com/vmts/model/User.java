package com.vmts.model;

import jakarta.persistence.*;
import lombok.*;

/** Login account. A DRIVER account is linked to exactly one Driver profile. */
@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 120)
  private String name;

  @Column(nullable = false, length = 160)
  private String email;

  @Column(nullable = false)
  private String passwordHash;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Role role;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "driver_id", unique = true)
  private Driver driver;
}
