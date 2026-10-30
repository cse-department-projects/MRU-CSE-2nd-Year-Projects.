package org.cse.academiaconnect.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"organizer", "registrations", "waitlists", "feedbacks", "certificates"})
@EqualsAndHashCode(exclude = {"organizer", "registrations", "waitlists", "feedbacks", "certificates"})
@Entity
@Table(name = "activities")
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Activity title is required")
    @Size(min = 5, max = 150, message = "Title must be between 5 and 150 characters")
    @Column(nullable = false, length = 150)
    private String title;

    @NotBlank(message = "Activity description is required")
    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Activity type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ActivityType type;

    @NotNull(message = "Activity date and time are required")
    
    @Column(name = "date_time", nullable = false)
    private LocalDateTime dateTime;

    @NotBlank(message = "Location is required")
    @Size(max = 255, message = "Location cannot exceed 255 characters")
    @Column(nullable = false)
    private String location;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    @Column(nullable = false)
    private Integer capacity;

    @NotNull(message = "Registration deadline is required")
   
    @Column(name = "registration_deadline", nullable = false)
    private LocalDateTime registrationDeadline;

    @NotNull(message = "Activity status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ActivityStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @NotNull(message = "Organizer is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    private User organizer;

    @OneToMany(mappedBy = "activity", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Registration> registrations = new ArrayList<>();

    @OneToMany(mappedBy = "activity", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Waitlist> waitlists = new ArrayList<>();

    @OneToMany(mappedBy = "activity", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Feedback> feedbacks = new ArrayList<>();

    @OneToMany(mappedBy = "activity", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Certificate> certificates = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ActivityType {
        WORKSHOP,
        SEMINAR,
        CONFERENCE,
        COMPETITION,
        GUEST_LECTURE,
        WEBINAR
    }

    public enum ActivityStatus {
        DRAFT,
        UPCOMING,
        ACTIVE,
        COMPLETED,
        CANCELLED
    }
}