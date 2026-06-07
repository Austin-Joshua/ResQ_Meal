package com.resqmeal.common;

import java.util.List;

public record ApiError(boolean success, String message, List<String> errors) {

  public static ApiError of(String message) {
    return new ApiError(false, message, null);
  }

  public static ApiError of(String message, List<String> errors) {
    return new ApiError(false, message, errors);
  }
}
