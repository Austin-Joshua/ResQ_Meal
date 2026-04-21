package com.resqmeal.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class RestExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(RestExceptionHandler.class);

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException e) {
    String msg =
        e.getBindingResult().getFieldErrors().stream()
            .findFirst()
            .map(f -> f.getField() + ": " + f.getDefaultMessage())
            .orElse("Validation failed");
    log.warn("Validation error: {}", msg);
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(errorBody("validation_error", msg));
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException e) {
    log.warn("Bad request: {}", e.getMessage());
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(errorBody("bad_request", e.getMessage() != null ? e.getMessage() : "Invalid argument"));
  }

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<Map<String, Object>> handleResponseStatus(ResponseStatusException e) {
    HttpStatus status = HttpStatus.resolve(e.getStatusCode().value());
    if (status == null) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }
    log.warn("HTTP {} : {}", status.value(), e.getReason());
    String msg = e.getReason() != null ? e.getReason() : status.getReasonPhrase();
    return ResponseEntity.status(status).body(errorBody("http_" + status.value(), msg));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, Object>> handleAny(Exception e) {
    log.error("Unhandled API error: {}", e.toString(), e);
    String message = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(errorBody("internal_error", message));
  }

  private static Map<String, Object> errorBody(String code, String message) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("success", false);
    m.put("error", code);
    m.put("message", message);
    return m;
  }
}
