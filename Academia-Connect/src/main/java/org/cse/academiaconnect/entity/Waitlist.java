package org.cse.academiaconnect.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user", "activity"})
@EqualsAndHashCode(exclude = {"user", "activity"})
@Entity
@Table(name = "waitlists", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "activity_id"})
})
public class Waitlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull(message = "Activity is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_id", nullable = false)
    private Activity activity;

    @Column(name = "added_at", nullable = false, updatable = false)
    private LocalDateTime addedAt;

    @NotNull(message = "Queue position is required")
    @Min(value = 1, message = "Queue position must be at least 1")
    @Column(name = "queue_position", nullable = false)
    private Integer queuePosition;

    @NotNull(message = "Waitlist status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WaitlistStatus status;

    @PrePersist
    protected void onCreate() {
        addedAt = LocalDateTime.now();
    }

    public enum WaitlistStatus {
        WAITING,
        CONVERTED,
        EXPIRED,
        CANCELLED
    }
}