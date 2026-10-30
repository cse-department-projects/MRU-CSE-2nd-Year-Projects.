package org.cse.academiaconnect.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import org.springframework.format.annotation.DateTimeFormat;

@Getter
@Setter
public class CreateActivityRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    private String location;

    @NotNull
    private Integer capacity;

    @NotNull
@DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm")
private LocalDateTime dateTime;

    @NotNull
@DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm")
private LocalDateTime registrationDeadline;

    @NotNull
    private String type;

    @NotNull
    private String status;
}