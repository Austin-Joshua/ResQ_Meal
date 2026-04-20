package com.resqmeal;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {
      "spring.datasource.url=jdbc:h2:mem:authflow;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
      "spring.datasource.driver-class-name=org.h2.Driver",
      "spring.datasource.username=sa",
      "spring.datasource.password=",
      "spring.sql.init.mode=always",
      "spring.sql.init.schema-locations=classpath:auth-flow-schema.sql",
      "jwt.secret=integration-test-secret-do-not-use-in-prod",
      "socketio.port=0",
      "app.traffic-security.enabled=false",
      "app.security.admin-user-ids="
    })
class AuthProtectedRouteFlowIT {

  @LocalServerPort private int port;
  @Autowired private TestRestTemplate rest;

  @Test
  void authAndProtectedRouteFlow_shouldEnforceAndAllowAsExpected() {
    String base = "http://localhost:" + port + "/api";

    ResponseEntity<Map> health = rest.getForEntity(base + "/health", Map.class);
    assertEquals(HttpStatus.OK, health.getStatusCode(), "health should be public");

    ResponseEntity<Map> unauthMe = rest.getForEntity(base + "/users/me", Map.class);
    assertEquals(HttpStatus.UNAUTHORIZED, unauthMe.getStatusCode(), "users/me should require auth");

    String email = "it+" + UUID.randomUUID() + "@example.com";
    String password = "Passw0rd!123";
    Map<String, Object> registerBody = new LinkedHashMap<>();
    registerBody.put("name", "Integration Test User");
    registerBody.put("email", email);
    registerBody.put("password", password);
    registerBody.put("role", "restaurant");

    ResponseEntity<Map> register =
        rest.postForEntity(base + "/auth/register", registerBody, Map.class);
    assertEquals(HttpStatus.CREATED, register.getStatusCode(), "register should succeed");

    Map<String, Object> loginBody = Map.of("email", email, "password", password);
    ResponseEntity<Map> login = rest.postForEntity(base + "/auth/login", loginBody, Map.class);
    assertEquals(HttpStatus.OK, login.getStatusCode(), "login should succeed");

    Object dataRaw = login.getBody() != null ? login.getBody().get("data") : null;
    assertNotNull(dataRaw, "login response should include data");
    assertInstanceOf(Map.class, dataRaw, "login data should be an object");
    @SuppressWarnings("unchecked")
    Map<String, Object> loginData = (Map<String, Object>) dataRaw;
    String token = String.valueOf(loginData.get("token"));
    assertNotNull(token, "login should return a JWT token");
    assertFalse(token.isBlank(), "login token should not be blank");

    HttpHeaders authHeaders = new HttpHeaders();
    authHeaders.setBearerAuth(token);
    HttpEntity<Void> authRequest = new HttpEntity<>(authHeaders);

    ResponseEntity<Map> authMe =
        rest.exchange(base + "/users/me", HttpMethod.GET, authRequest, Map.class);
    assertEquals(HttpStatus.OK, authMe.getStatusCode(), "users/me should allow authenticated user");

    ResponseEntity<Map> adminLogs =
        rest.exchange(base + "/admin/logs?limit=5", HttpMethod.GET, authRequest, Map.class);
    assertEquals(HttpStatus.FORBIDDEN, adminLogs.getStatusCode(), "non-admin should be denied admin route");
  }
}
