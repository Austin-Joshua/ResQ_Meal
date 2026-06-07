package com.resqmeal.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

import java.time.Instant;

public class FoodPostRequest {

  @NotBlank
  @JsonProperty("food_name")
  private String title;

  @Positive
  @JsonProperty("quantity_servings")
  private Integer quantity;

  @Future
  @JsonProperty("expiry_time")
  private Instant expiryTime;

  @NotBlank
  @JsonProperty("food_type")
  private String foodType;

  @NotBlank private String address;

  private String description;

  private Double latitude;
  private Double longitude;

  @JsonProperty("safety_window_minutes")
  private Integer safetyWindowMinutes;

  @JsonProperty("min_storage_temp_celsius")
  private Double minStorageTempCelsius;

  @JsonProperty("max_storage_temp_celsius")
  private Double maxStorageTempCelsius;

  @JsonProperty("availability_time_hours")
  private Integer availabilityTimeHours;

  @JsonProperty("photo_url")
  private String photoUrl;

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public Integer getQuantity() {
    return quantity;
  }

  public void setQuantity(Integer quantity) {
    this.quantity = quantity;
  }

  public Instant getExpiryTime() {
    return expiryTime;
  }

  public void setExpiryTime(Instant expiryTime) {
    this.expiryTime = expiryTime;
  }

  public String getFoodType() {
    return foodType;
  }

  public void setFoodType(String foodType) {
    this.foodType = foodType;
  }

  public String getAddress() {
    return address;
  }

  public void setAddress(String address) {
    this.address = address;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public Double getLatitude() {
    return latitude;
  }

  public void setLatitude(Double latitude) {
    this.latitude = latitude;
  }

  public Double getLongitude() {
    return longitude;
  }

  public void setLongitude(Double longitude) {
    this.longitude = longitude;
  }

  public Integer getSafetyWindowMinutes() {
    return safetyWindowMinutes;
  }

  public void setSafetyWindowMinutes(Integer safetyWindowMinutes) {
    this.safetyWindowMinutes = safetyWindowMinutes;
  }

  public Double getMinStorageTempCelsius() {
    return minStorageTempCelsius;
  }

  public void setMinStorageTempCelsius(Double minStorageTempCelsius) {
    this.minStorageTempCelsius = minStorageTempCelsius;
  }

  public Double getMaxStorageTempCelsius() {
    return maxStorageTempCelsius;
  }

  public void setMaxStorageTempCelsius(Double maxStorageTempCelsius) {
    this.maxStorageTempCelsius = maxStorageTempCelsius;
  }

  public Integer getAvailabilityTimeHours() {
    return availabilityTimeHours;
  }

  public void setAvailabilityTimeHours(Integer availabilityTimeHours) {
    this.availabilityTimeHours = availabilityTimeHours;
  }

  public String getPhotoUrl() {
    return photoUrl;
  }

  public void setPhotoUrl(String photoUrl) {
    this.photoUrl = photoUrl;
  }
}

