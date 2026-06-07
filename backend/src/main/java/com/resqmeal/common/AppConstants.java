package com.resqmeal.common;

public final class AppConstants {

  private AppConstants() {}

  // JWT / auth
  public static final String AUTH_HEADER = "Authorization";
  public static final String TOKEN_PREFIX = "Bearer ";

  // Roles
  public static final String ROLE_RESTAURANT = "restaurant";
  public static final String ROLE_NGO = "ngo";
  public static final String ROLE_VOLUNTEER = "volunteer";
  public static final String ROLE_ADMIN = "admin";

  // Food post statuses
  public static final String FOOD_STATUS_POSTED = "POSTED";
  public static final String FOOD_STATUS_MATCHED = "MATCHED";
  public static final String FOOD_STATUS_EXPIRED = "EXPIRED";
  public static final String FOOD_STATUS_CANCELLED = "CANCELLED";

  // Match statuses
  public static final String MATCH_PENDING = "PENDING";
  public static final String MATCH_MATCHED = "MATCHED";
  public static final String MATCH_ACCEPTED = "ACCEPTED";
  public static final String MATCH_REJECTED = "REJECTED";
  public static final String MATCH_PICKED_UP = "PICKED_UP";
  public static final String MATCH_DELIVERED = "DELIVERED";

  // Freshness source
  public static final String SOURCE_ML = "ml";
  public static final String SOURCE_RULE_BASED = "rule-based";

  // Pagination defaults
  public static final int DEFAULT_PAGE = 0;
  public static final int DEFAULT_PAGE_SIZE = 20;
  public static final int MAX_PAGE_SIZE = 100;
}
