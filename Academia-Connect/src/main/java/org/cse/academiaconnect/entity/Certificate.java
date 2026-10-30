package org.cse.academiaconnect.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user", "activity"})
@EqualsAndHashCode(exclude = {"user", "activity"})
@Entity
@Table(name = "certificates", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "activity_id"})
})
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Certificate code is required")
    @Size(max = 100, message = "Certificate code cannot exceed 100 characters")
    @Column(name = "certificate_code", unique = true, nullable = false, length = 100)
    private String certificateCode;

    @NotNull(message = "Issue date is required")
    @PastOrPresent(message = "Issue date cannot be in the future")
    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @NotBlank(message = "Credential URL is required")
    @Size(max = 255, message = "Credential URL cannot exceed 255 characters")
    @Column(name = "credential_url", nullable = false)
    private String credentialUrl;

    // Relationships
    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull(message = "Activity is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_id", nullable = false)
    private Activity activity;
}