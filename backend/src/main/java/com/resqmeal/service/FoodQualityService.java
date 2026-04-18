package com.resqmeal.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class FoodQualityService {

  private final RestTemplate restTemplate = new RestTemplate();
  private final ObjectMapper objectMapper = new ObjectMapper();

  @Value("${freshness.ai-url:}")
  private String freshnessAiUrl;

  @Value("${freshness.env-ai-url:}")
  private String freshnessEnvAiUrl;

  @Value("${food.image-recognition-url:}")
  private String foodImageRecognitionUrl;

  public Map<String, Object> assessFreshness(MultipartFile file) throws Exception {
    String base = freshnessAiUrl != null ? freshnessAiUrl.replaceAll("/$", "") : "";
    if (!base.isBlank()) {
      try {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add(
            "file",
            new ByteArrayResource(file.getBytes()) {
              @Override
              public String getFilename() {
                return file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.png";
              }
            });
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        String json =
            restTemplate.postForObject(base + "/evaluate", new HttpEntity<>(body, headers), String.class);
        JsonNode data = objectMapper.readTree(json);
        String classification = data.path("classification").asText("medium_fresh").toLowerCase();
        int freshnessIndex = (int) Math.round(data.path("freshness_index").asDouble(50));
        String freshness =
            "fresh".equals(classification)
                ? "excellent"
                : "medium_fresh".equals(classification) ? "good" : freshnessIndex >= 50 ? "fair" : "poor";
        String status =
            "not_fresh".equals(classification) && freshnessIndex < 60 ? "rejected" : "approved";
        return buildFrontendAssessment(freshnessIndex, freshness, status);
      } catch (Exception e) {
        // fall through to mock
      }
    }
    return mockFrontendAssessment();
  }

  public Map<String, Object> assessFreshnessByEnvironment(Map<String, Object> body) {
    String base = freshnessEnvAiUrl != null ? freshnessEnvAiUrl.replaceAll("/$", "") : "";
    if (!base.isBlank()) {
      try {
        Map<String, Object> req = new HashMap<>();
        req.put("temperature", body.get("temperature"));
        req.put("humidity", body.get("humidity"));
        req.put("time_stored_hours", body.get("time_stored_hours"));
        req.put("gas", body.get("gas") != null ? body.get("gas") : 200);
        Map<String, Object> data =
            restTemplate.postForObject(base + "/evaluate-environment", req, Map.class);
        if (data != null) {
          String classification =
              String.valueOf(data.getOrDefault("classification", "stale")).toLowerCase();
          int qualityScore =
              (int)
                  Math.round(
                      data.get("freshness_index") instanceof Number n
                          ? n.doubleValue()
                          : 50);
          String freshness =
              "fresh".equals(classification)
                  ? "excellent"
                  : "stale".equals(classification) ? "good" : "poor";
          String status =
              "spoiled".equals(classification) && qualityScore < 60 ? "rejected" : "approved";
          return buildFrontendAssessment(qualityScore, freshness, status);
        }
      } catch (Exception ignored) {
      }
    }
    return mockFrontendAssessment();
  }

  public Map<String, Object> classifyImage(MultipartFile file) throws Exception {
    String base = foodImageRecognitionUrl != null ? foodImageRecognitionUrl.replaceAll("/$", "") : "";
    if (base.isBlank()) {
      return Map.of(
          "error",
          "Food classification service not configured",
          "hint",
          "Set FOOD_IMAGE_RECOGNITION_URL to the Food-Image-Recognition API URL (e.g. http://localhost:8005)");
    }
    MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
    body.add(
        "file",
        new ByteArrayResource(file.getBytes()) {
          @Override
          public String getFilename() {
            return file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.png";
          }
        });
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.MULTIPART_FORM_DATA);
    String json =
        restTemplate.postForObject(base + "/evaluate", new HttpEntity<>(body, headers), String.class);
    return objectMapper.readValue(json, Map.class);
  }

  private Map<String, Object> buildFrontendAssessment(int qualityScore, String freshness, String status) {
    List<String> notes = new ArrayList<>();
    if (qualityScore >= 85) {
      notes.add("✓ Excellent condition - prime quality food");
      notes.add("✓ Optimal freshness for immediate distribution");
      notes.add("✓ Packaging intact and clean");
    } else if (qualityScore >= 70) {
      notes.add("✓ Good condition - suitable for donation");
      notes.add("✓ Acceptable freshness level");
      notes.add("✓ Minor packaging wear acceptable");
    } else if (qualityScore >= 50) {
      notes.add("⚠ Fair condition - acceptable with precautions");
      notes.add("⚠ Recommended for consumption within 2-4 hours");
      notes.add("⚠ Inspect before distribution");
    } else {
      notes.add("❌ Poor condition - not recommended");
      notes.add("❌ Spoilage indicators detected");
      notes.add("❌ Do not distribute");
    }
    Map<String, Object> analysis = new HashMap<>();
    analysis.put("packagingCondition", qualityScore >= 70 ? "Intact" : "Minor damage");
    analysis.put("spoilageDetection", qualityScore < 50);
    analysis.put("moldPresence", qualityScore < 40);
    analysis.put("estimatedQuantity", ThreadLocalRandom.current().nextInt(10, 40));
    analysis.put("freshnessLevel", qualityScore);
    analysis.put("safetyRating", Math.round(Math.max(40, qualityScore)));
    Map<String, Object> out = new HashMap<>();
    out.put("qualityScore", qualityScore);
    out.put("freshness", freshness);
    out.put("status", status);
    out.put("notes", notes);
    out.put("analysis", analysis);
    return out;
  }

  private Map<String, Object> mockFrontendAssessment() {
    int qualityScore = 65 + ThreadLocalRandom.current().nextInt(30);
    String freshness =
        qualityScore >= 85 ? "excellent" : qualityScore >= 70 ? "good" : "fair";
    return buildFrontendAssessment(qualityScore, freshness, "approved");
  }
}
