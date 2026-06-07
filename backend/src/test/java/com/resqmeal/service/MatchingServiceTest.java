package com.resqmeal.service;

import com.resqmeal.config.MatchingWeightsConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MatchingServiceTest {

  private MatchingService matchingService;

  @BeforeEach
  void setUp() {
    matchingService = new MatchingService(null, null, null, new MatchingWeightsConfig());
  }

  @Test
  void closerNgo_scoresHigherThanFartherNgo() {
    double near = matchingService.calculateWeightedScore(1.0, 120, 100, 50, "meals");
    double far = matchingService.calculateWeightedScore(15.0, 120, 100, 50, "meals");
    assertTrue(near > far);
  }

  @Test
  void oneHourToExpiry_scoresHigherFreshnessThanSixHours() {
    double oneHour = matchingService.scoreFreshnessComponent(60);
    double sixHours = matchingService.scoreFreshnessComponent(360);
    assertTrue(oneHour > sixHours);
  }

  @Test
  void fullCapacity_scoresZeroOnCapacityWeight() {
    assertEquals(0, matchingService.scoreCapacityComponent(100, 100));
  }

  @Test
  void foodTypeMismatch_scoresZeroOnFoodTypeWeight() {
    assertEquals(0, matchingService.scoreFoodTypeComponent("dairy"));
  }

  @Test
  void criticalNeedLevel_appliesDemandBoost() {
    double base = 0.8;
    double boosted = matchingService.applyDemandBoost(base, 10);
    assertTrue(boosted > base);
    assertEquals(1.0, boosted, 0.001);
  }

  @Test
  void threeNgos_rankedInCorrectOrder() {
    record NgoScore(String name, double score) {}

    List<NgoScore> ngos = new ArrayList<>();
    ngos.add(
        new NgoScore(
            "far_full",
            matchingService.applyDemandBoost(
                matchingService.calculateWeightedScore(20, 360, 100, 100, "dairy"), 0)));
    ngos.add(
        new NgoScore(
            "near_good",
            matchingService.applyDemandBoost(
                matchingService.calculateWeightedScore(2, 60, 100, 20, "meals"), 10)));
    ngos.add(
        new NgoScore(
            "mid_ok",
            matchingService.applyDemandBoost(
                matchingService.calculateWeightedScore(8, 120, 100, 40, "meals"), 3)));
    ngos.sort(Comparator.comparingDouble(NgoScore::score).reversed());
    assertEquals("near_good", ngos.get(0).name());
    assertEquals("mid_ok", ngos.get(1).name());
    assertEquals("far_full", ngos.get(2).name());
  }
}
