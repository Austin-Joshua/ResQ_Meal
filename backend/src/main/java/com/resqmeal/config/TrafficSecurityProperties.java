package com.resqmeal.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.traffic-security")
public class TrafficSecurityProperties {

  /** When false, traffic is not wrapped or sent to the ML service. */
  private boolean enabled = false;

  /** Base URL of the traffic-security ML FastAPI service. */
  private String mlServiceBaseUrl = "http://127.0.0.1:8091";

  private int maxBodyBytes = 65536;

  private int connectTimeoutMs = 500;

  private int readTimeoutMs = 5000;

  /**
   * Optional HTTPS endpoint (e.g. Firebase Cloud Function) that receives JSON POSTs for push /
   * mobile alerts. Left blank to skip.
   */
  private String firebaseWebhookUrl = "";

  private String firebaseWebhookSecret = "";

  /** When true and ML returns malicious, the client IP may be auto-blocked (use with care). */
  private boolean blockOnMalicious = false;

  public boolean isEnabled() {
    return enabled;
  }

  public void setEnabled(boolean enabled) {
    this.enabled = enabled;
  }

  public String getMlServiceBaseUrl() {
    return mlServiceBaseUrl;
  }

  public void setMlServiceBaseUrl(String mlServiceBaseUrl) {
    this.mlServiceBaseUrl = mlServiceBaseUrl;
  }

  public int getMaxBodyBytes() {
    return maxBodyBytes;
  }

  public void setMaxBodyBytes(int maxBodyBytes) {
    this.maxBodyBytes = maxBodyBytes;
  }

  public int getConnectTimeoutMs() {
    return connectTimeoutMs;
  }

  public void setConnectTimeoutMs(int connectTimeoutMs) {
    this.connectTimeoutMs = connectTimeoutMs;
  }

  public int getReadTimeoutMs() {
    return readTimeoutMs;
  }

  public void setReadTimeoutMs(int readTimeoutMs) {
    this.readTimeoutMs = readTimeoutMs;
  }

  public String getFirebaseWebhookUrl() {
    return firebaseWebhookUrl;
  }

  public void setFirebaseWebhookUrl(String firebaseWebhookUrl) {
    this.firebaseWebhookUrl = firebaseWebhookUrl;
  }

  public String getFirebaseWebhookSecret() {
    return firebaseWebhookSecret;
  }

  public void setFirebaseWebhookSecret(String firebaseWebhookSecret) {
    this.firebaseWebhookSecret = firebaseWebhookSecret;
  }

  public boolean isBlockOnMalicious() {
    return blockOnMalicious;
  }

  public void setBlockOnMalicious(boolean blockOnMalicious) {
    this.blockOnMalicious = blockOnMalicious;
  }
}
