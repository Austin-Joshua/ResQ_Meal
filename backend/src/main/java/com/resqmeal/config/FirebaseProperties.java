package com.resqmeal.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.firebase")
public class FirebaseProperties {

  private boolean enabled = false;
  private String projectId = "";
  /** Service account JSON (single line or multiline) for Firebase Admin SDK */
  private String serviceAccountJson = "";

  public boolean isEnabled() {
    return enabled;
  }

  public void setEnabled(boolean enabled) {
    this.enabled = enabled;
  }

  public String getProjectId() {
    return projectId;
  }

  public void setProjectId(String projectId) {
    this.projectId = projectId != null ? projectId.trim() : "";
  }

  public String getServiceAccountJson() {
    return serviceAccountJson;
  }

  public void setServiceAccountJson(String serviceAccountJson) {
    this.serviceAccountJson = serviceAccountJson != null ? serviceAccountJson.trim() : "";
  }
}
