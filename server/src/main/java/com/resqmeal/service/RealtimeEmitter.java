package com.resqmeal.service;

import java.util.Map;

public interface RealtimeEmitter {

  void emitToUser(long userId, String event, Map<String, Object> payload);

  void broadcast(String event, Map<String, Object> payload);
}
