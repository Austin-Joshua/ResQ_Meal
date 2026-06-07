package com.resqmeal.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public record ApiResponse<T>(boolean success, T data, String message) {

  public static <T> ApiResponse<T> ok(T data) {
    return new ApiResponse<>(true, data, null);
  }

  public static <T> ApiResponse<T> ok(T data, String message) {
    return new ApiResponse<>(true, data, message);
  }

  public static <T> ResponseEntity<ApiResponse<T>> okEntity(T data) {
    return ResponseEntity.ok(ok(data));
  }

  public static <T> ResponseEntity<ApiResponse<T>> createdEntity(T data) {
    return ResponseEntity.status(HttpStatus.CREATED).body(ok(data));
  }

  public static ResponseEntity<ApiResponse<Void>> noContentEntity(String message) {
    return ResponseEntity.ok(new ApiResponse<>(true, null, message));
  }
}
