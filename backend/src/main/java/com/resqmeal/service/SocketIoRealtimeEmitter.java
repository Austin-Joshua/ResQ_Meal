package com.resqmeal.service;

import com.corundumstudio.socketio.SocketIOServer;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class SocketIoRealtimeEmitter implements RealtimeEmitter {

  private final SocketIOServer server;

  public SocketIoRealtimeEmitter(SocketIOServer server) {
    this.server = server;
  }

  @Override
  public void emitToUser(long userId, String event, Map<String, Object> payload) {
    server.getRoomOperations("user:" + userId).sendEvent(event, payload);
  }

  @Override
  public void broadcast(String event, Map<String, Object> payload) {
    server.getBroadcastOperations().sendEvent(event, payload);
  }
}
