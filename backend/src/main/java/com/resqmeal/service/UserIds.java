package com.resqmeal.service;

import org.springframework.jdbc.core.JdbcTemplate;

import java.util.Optional;

public final class UserIds {

  private UserIds() {}

  public static Optional<Long> restaurantId(JdbcTemplate jdbc, long userId) {
    return Optional.ofNullable(
        jdbc.query(
            "SELECT id FROM restaurants WHERE user_id = ?",
            rs -> rs.next() ? rs.getLong("id") : null,
            userId));
  }

  public static Optional<Long> ngoId(JdbcTemplate jdbc, long userId) {
    return Optional.ofNullable(
        jdbc.query(
            "SELECT id FROM ngos WHERE user_id = ?",
            rs -> rs.next() ? rs.getLong("id") : null,
            userId));
  }

  public static Optional<Long> volunteerId(JdbcTemplate jdbc, long userId) {
    return Optional.ofNullable(
        jdbc.query(
            "SELECT id FROM volunteers WHERE user_id = ?",
            rs -> rs.next() ? rs.getLong("id") : null,
            userId));
  }
}
