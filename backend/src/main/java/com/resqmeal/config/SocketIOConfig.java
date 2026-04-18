package com.resqmeal.config;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DisconnectListener;
import com.resqmeal.security.JwtUtil;
import io.jsonwebtoken.Claims;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SocketIOConfig {

  private static final Logger log = LoggerFactory.getLogger(SocketIOConfig.class);

  @Bean(destroyMethod = "stop")
  public SocketIOServer socketIOServer(
      JwtUtil jwtUtil,
      @Value("${socketio.port:9090}") int port,
      @Value("${socketio.host:0.0.0.0}") String host) {
    com.corundumstudio.socketio.Configuration config = new com.corundumstudio.socketio.Configuration();
    config.setHostname(host);
    config.setPort(port);
    config.setContext("/socket.io");

    SocketIOServer server = new SocketIOServer(config);

    server.addConnectListener(
        (ConnectListener)
            client -> {
              try {
                String token = resolveToken(client);
                if (token == null || token.isBlank()) {
                  client.disconnect();
                  return;
                }
                Claims claims = jwtUtil.parse(token);
                Long userId = claims.get("id", Long.class);
                if (userId == null && claims.getSubject() != null) {
                  userId = Long.parseLong(claims.getSubject());
                }
                String role = claims.get("role", String.class);
                if (userId == null) {
                  client.disconnect();
                  return;
                }
                client.set("userId", userId);
                client.joinRoom("user:" + userId);
                if (role != null && !role.isBlank()) {
                  client.joinRoom("role:" + role.toLowerCase());
                }
                log.info("[Socket] User {} ({}) connected", userId, role);
              } catch (Exception e) {
                log.warn("[Socket] Auth failed: {}", e.getMessage());
                client.disconnect();
              }
            });

    server.addDisconnectListener(
        (DisconnectListener)
            client -> {
              Object uid = client.get("userId");
              log.info("[Socket] User {} disconnected", uid);
            });

    try {
      server.start();
      log.info("Socket.IO server listening on {}:{}", host, port);
    } catch (Exception e) {
      log.error("Socket.IO server failed to start: {}", e.getMessage());
    }

    return server;
  }

  private static String resolveToken(com.corundumstudio.socketio.SocketIOClient client) {
    if (client.getHandshakeData().getHttpHeaders().get("Authorization") != null) {
      String h = client.getHandshakeData().getHttpHeaders().get("Authorization");
      if (h != null && h.startsWith("Bearer ")) {
        return h.substring(7);
      }
    }
    String q = client.getHandshakeData().getSingleUrlParam("token");
    if (q != null && !q.isBlank()) {
      return q;
    }
    return null;
  }
}
