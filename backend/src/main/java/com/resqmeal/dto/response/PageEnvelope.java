package com.resqmeal.dto.response;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class PageEnvelope {

  private PageEnvelope() {}

  public static Map<String, Object> of(
      List<?> content, int page, int size, long totalElements) {
    int totalPages = size > 0 ? (int) Math.ceil((double) totalElements / size) : 0;
    Map<String, Object> envelope = new HashMap<>();
    envelope.put("content", content);
    envelope.put("page", page);
    envelope.put("size", size);
    envelope.put("totalElements", totalElements);
    envelope.put("totalPages", totalPages);
    return envelope;
  }
}


