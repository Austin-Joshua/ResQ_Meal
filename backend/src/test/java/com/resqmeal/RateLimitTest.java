package com.resqmeal;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(
    properties = {
      "spring.flyway.enabled=false",
      "spring.datasource.url=jdbc:h2:mem:ratelimit;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
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
class RateLimitTest {

  @Autowired private MockMvc mockMvc;

  private static final String LOGIN_BODY =
      "{\"email\":\"nobody@example.com\",\"password\":\"wrong-password\"}";

  @Test
  void authEndpoints_shouldReturn429AfterFiveRequestsPerMinute() throws Exception {
    for (int i = 0; i < 5; i++) {
      mockMvc
          .perform(
              post("/api/auth/login")
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(LOGIN_BODY))
          .andExpect(status().is4xxClientError());
    }

    mockMvc
        .perform(
            post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(LOGIN_BODY))
        .andExpect(status().isTooManyRequests())
        .andExpect(content().string(org.hamcrest.Matchers.containsString("Too many attempts")));
  }
}
