package com.resqmeal.controller;

import com.resqmeal.security.JwtUtil;
import com.resqmeal.service.FoodService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(
    properties = {
      "spring.flyway.enabled=false",
      "spring.datasource.url=jdbc:h2:mem:foodpostctrl;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
      "spring.datasource.driver-class-name=org.h2.Driver",
      "spring.datasource.username=sa",
      "spring.datasource.password=",
      "spring.sql.init.mode=always",
      "spring.sql.init.schema-locations=classpath:auth-flow-schema.sql",
      "jwt.secret=integration-test-secret-do-not-use-in-prod-32chars",
      "socketio.port=0",
      "app.traffic-security.enabled=false",
      "app.security.admin-user-ids=",
      "app.attack-sim.enabled=false"
    })
@AutoConfigureMockMvc
class FoodPostControllerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private JwtUtil jwtUtil;
  @MockBean private FoodService foodService;

  private static final String VALID_BODY =
      """
      {
        "food_name": "Fresh Soup",
        "quantity_servings": 10,
        "expiry_time": "2026-12-31T12:00:00Z",
        "food_type": "meals",
        "address": "123 Main St"
      }
      """;

  @Test
  void postFoodPost_withoutAuth_returns401() throws Exception {
    mockMvc
        .perform(post("/api/food").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void postFoodPost_withValidBody_returns201() throws Exception {
    when(foodService.postFood(anyLong(), any())).thenReturn(Map.of("id", 1));
    String token = jwtUtil.generateToken(1L, "restaurant");

    mockMvc
        .perform(
            post("/api/food")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(VALID_BODY))
        .andExpect(status().isCreated());
  }

  @Test
  void postFoodPost_withMissingFields_returns400WithFieldErrors() throws Exception {
    String token = jwtUtil.generateToken(1L, "restaurant");

    mockMvc
        .perform(
            post("/api/food")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors").isArray());
  }
}

