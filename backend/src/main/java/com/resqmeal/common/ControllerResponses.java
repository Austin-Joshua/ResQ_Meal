package com.resqmeal.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public final class ControllerResponses {

  private ControllerResponses() {}

  public static <T> ResponseEntity<ApiResponse<T>> ok(T data) {
    return ResponseEntity.ok(ApiResponse.ok(data));
  }

  public static <T> ResponseEntity<ApiResponse<T>> created(T data) {
    return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(data));
  }

  public static <T> ResponseEntity<ApiResponse<T>> ok(T data, String message) {
    return ResponseEntity.ok(ApiResponse.ok(data, message));
  }

  public static ResponseEntity<ApiError> unauthorized() {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(ApiError.of("Access token required"));
  }
}
