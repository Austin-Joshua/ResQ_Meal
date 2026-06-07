package com.resqmeal.exception;

import com.resqmeal.common.ApiError;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException e) {
    List<String> errors =
        e.getBindingResult().getFieldErrors().stream()
            .map(GlobalExceptionHandler::formatFieldError)
            .collect(Collectors.toList());
    log.warn("Validation error: {}", errors);
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(ApiError.of("Validation failed", errors));
  }

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException e) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(ApiError.of(e.getMessage() != null ? e.getMessage() : "Not found"));
  }

  @ExceptionHandler(UnauthorizedException.class)
  public ResponseEntity<ApiError> handleUnauthorized(UnauthorizedException e) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(ApiError.of(e.getMessage() != null ? e.getMessage() : "Unauthorized"));
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException e) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiError.of("Access denied"));
  }

  @ExceptionHandler(DuplicateResourceException.class)
  public ResponseEntity<ApiError> handleDuplicate(DuplicateResourceException e) {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(ApiError.of(e.getMessage() != null ? e.getMessage() : "Resource already exists"));
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<ApiError> handleDataIntegrity(DataIntegrityViolationException e) {
    log.warn("Data integrity violation: {}", e.getMessage());
    return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiError.of("Resource already exists"));
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException e) {
    log.warn("Bad request: {}", e.getMessage());
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(ApiError.of(e.getMessage() != null ? e.getMessage() : "Invalid argument"));
  }

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<ApiError> handleResponseStatus(ResponseStatusException e) {
    HttpStatus status = HttpStatus.resolve(e.getStatusCode().value());
    if (status == null) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }
    String msg = e.getReason() != null ? e.getReason() : status.getReasonPhrase();
    return ResponseEntity.status(status).body(ApiError.of(msg));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiError> handleAny(Exception e) {
    log.error("Unhandled API error: {}", e.toString(), e);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(ApiError.of("Internal server error"));
  }

  private static String formatFieldError(FieldError fieldError) {
    return fieldError.getField() + ": " + fieldError.getDefaultMessage();
  }
}
