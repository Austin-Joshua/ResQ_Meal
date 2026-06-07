package com.resqmeal.dto.request;

import jakarta.validation.constraints.NotBlank;

public class GoogleAuthRequest {

  @NotBlank(message = "Google ID token is required")
  private String idToken;

  /** Used when creating a new account (restaurant, ngo, volunteer). Defaults to volunteer. */
  private String role;

  public String getIdToken() {
    return idToken;
  }

  public void setIdToken(String idToken) {
    this.idToken = idToken;
  }

  public String getRole() {
    return role;
  }

  public void setRole(String role) {
    this.role = role;
  }
}
