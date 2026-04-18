package com.resqmeal.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resqmeal.config.TrafficSecurityProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class TrafficMlRemoteClient {

  private static final Logger log = LoggerFactory.getLogger(TrafficMlRemoteClient.class);

  private final WebClient trafficSecurityWebClient;
  private final TrafficSecurityProperties props;
  private final ObjectMapper objectMapper = new ObjectMapper();

  public TrafficMlRemoteClient(WebClient trafficSecurityWebClient, TrafficSecurityProperties props) {
    this.trafficSecurityWebClient = trafficSecurityWebClient;
    this.props = props;
  }

  @SuppressWarnings("unchecked")
  public List<Map<String, Object>> predictBatch(List<Map<String, Object>> items) {
    if (!props.isEnabled() || items.isEmpty()) {
      return List.of();
    }
    Map<String, Object> req = new LinkedHashMap<>();
    req.put("items", items);
    try {
      String json =
          trafficSecurityWebClient
              .post()
              .uri("/internal/predict/batch")
              .bodyValue(req)
              .retrieve()
              .bodyToMono(String.class)
              .block(Duration.ofMillis(props.getReadTimeoutMs()));
      Map<String, Object> root = objectMapper.readValue(json, new TypeReference<>() {});
      Object r = root.get("results");
      if (r instanceof List<?> list) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (Object o : list) {
          if (o instanceof Map<?, ?> m) {
            out.add((Map<String, Object>) m);
          }
        }
        return out;
      }
    } catch (WebClientResponseException e) {
      log.warn("Traffic ML HTTP {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
    } catch (Exception e) {
      log.warn("Traffic ML call failed: {}", e.getMessage());
    }
    return List.of();
  }
}
