package com.vmts.exception;

/** Business-rule violation such as duplicate registration numbers (HTTP 409). */
public class ConflictException extends RuntimeException {
  public ConflictException(String message) {
    super(message);
  }
}
