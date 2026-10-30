package com.vmts.exception;

import com.vmts.dto.ApiError;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Converts exceptions into a consistent JSON error body: { status, message, fieldErrors? }. */
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
    Map<String, String> fields = new LinkedHashMap<>();
    ex.getBindingResult().getFieldErrors()
        .forEach(fe -> fields.putIfAbsent(fe.getField(), fe.getDefaultMessage()));
    return build(HttpStatus.BAD_REQUEST, "Validation failed", fields);
  }

  @ExceptionHandler({HttpMessageNotReadableException.class, IllegalArgumentException.class})
  public ResponseEntity<ApiError> handleBadRequest(Exception ex) {
    return build(HttpStatus.BAD_REQUEST, "Invalid request body", null);
  }

  @ExceptionHandler(NotFoundException.class)
  public ResponseEntity<ApiError> handleNotFound(NotFoundException ex) {
    return build(HttpStatus.NOT_FOUND, ex.getMessage(), null);
  }

  @ExceptionHandler(ConflictException.class)
  public ResponseEntity<ApiError> handleConflict(ConflictException ex) {
    return build(HttpStatus.CONFLICT, ex.getMessage(), null);
  }

  @ExceptionHandler(ForbiddenException.class)
  public ResponseEntity<ApiError> handleForbidden(ForbiddenException ex) {
    return build(HttpStatus.FORBIDDEN, ex.getMessage(), null);
  }

  @ExceptionHandler(BadCredentialsException.class)
  public ResponseEntity<ApiError> handleBadCredentials(BadCredentialsException ex) {
    return build(HttpStatus.UNAUTHORIZED, "Invalid email or password", null);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiError> handleOther(Exception ex) {
    return build(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong. Please try again.", null);
  }

  private ResponseEntity<ApiError> build(HttpStatus status, String message, Map<String, String> fields) {
    return ResponseEntity.status(status).body(new ApiError(status.value(), message, fields));
  }
}
