package com.resqmeal.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

public class CreateMatchRequest {

  @NotNull
  @JsonProperty("food_post_id")
  private Long foodPostId;

  @JsonProperty("ngo_id")
  private Long ngoId;

  public Long getFoodPostId() {
    return foodPostId;
  }

  public void setFoodPostId(Long foodPostId) {
    this.foodPostId = foodPostId;
  }

  public Long getNgoId() {
    return ngoId;
  }

  public void setNgoId(Long ngoId) {
    this.ngoId = ngoId;
  }
}

