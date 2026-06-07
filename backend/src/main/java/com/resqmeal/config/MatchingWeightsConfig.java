package com.resqmeal.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "matching")
public class MatchingWeightsConfig {

  private double distanceWeight = 0.40;
  private double freshnessWeight = 0.30;
  private double capacityWeight = 0.20;
  private double foodTypeWeight = 0.10;

  public double getDistanceWeight() {
    return distanceWeight;
  }

  public void setDistanceWeight(double distanceWeight) {
    this.distanceWeight = distanceWeight;
  }

  public double getFreshnessWeight() {
    return freshnessWeight;
  }

  public void setFreshnessWeight(double freshnessWeight) {
    this.freshnessWeight = freshnessWeight;
  }

  public double getCapacityWeight() {
    return capacityWeight;
  }

  public void setCapacityWeight(double capacityWeight) {
    this.capacityWeight = capacityWeight;
  }

  public double getFoodTypeWeight() {
    return foodTypeWeight;
  }

  public void setFoodTypeWeight(double foodTypeWeight) {
    this.foodTypeWeight = foodTypeWeight;
  }
}
