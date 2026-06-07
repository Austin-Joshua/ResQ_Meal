package com.resqmeal.config;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DisconnectListener;
import com.resqmeal.common.AppConstants;
import com.resqmeal.security.JwtUtil;
import io.jsonwebtoken.Claims;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SocketIOConfig implements ApplicationListener<ApplicationReadyEvent> {

  private static final Logger log = LoggerFactory.getLogger(SocketIOConfig.class);

  private SocketIOServer server;

  @Bean(destroyMethod = "stop")
  public SocketIOServer socketIOServer(
      JwtUtil jwtUtil,
      @Value("${server.port}") int serverPort,
      @Value("${socketio.port:#{null}}") Integer socketPortOverride,
      @Value("${socketio.host:0.0.0.0}") String host) {
    int port = socketPortOverride != null ? socketPortOverride : serverPort;

    com.corundumstudio.socketio.Configuration config = new com.corundumstudio.socketio.Configuration();
    config.setHostname(host);
    config.setPort(port);
    config.setContext("/socket.io");

    server = new SocketIOServer(config);

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

    return server;
  }

  @Override
  public void onApplicationEvent(ApplicationReadyEvent event) {
    if (server == null) {
      return;
    }
    try {
      server.start();
      log.info("Socket.IO server listening on {}:{}", server.getConfiguration().getHostname(), server.getConfiguration().getPort());
    } catch (Exception e) {
      log.error("Socket.IO server failed to start: {}", e.getMessage());
    }
  }

  private static String resolveToken(com.corundumstudio.socketio.SocketIOClient client) {
    if (client.getHandshakeData().getHttpHeaders().get(AppConstants.AUTH_HEADER) != null) {
      String h = client.getHandshakeData().getHttpHeaders().get(AppConstants.AUTH_HEADER);
      if (h != null && h.startsWith(AppConstants.TOKEN_PREFIX)) {
        return h.substring(AppConstants.TOKEN_PREFIX.length());
      }
    }
    String q = client.getHandshakeData().getSingleUrlParam("token");
    if (q != null && !q.isBlank()) {
      return q;
    }
    return null;
  }
}
