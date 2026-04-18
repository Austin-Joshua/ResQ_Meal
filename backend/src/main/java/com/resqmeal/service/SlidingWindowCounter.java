package com.resqmeal.service;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

/** Counts events in a sliding time window (per key). */
public final class SlidingWindowCounter {

  private final ConcurrentHashMap<String, Deque<Long>> buckets = new ConcurrentHashMap<>();
  private final long windowMs;

  public SlidingWindowCounter(long windowMs) {
    this.windowMs = windowMs;
  }

  /** Records one event and returns the count of events in the window including this one. */
  public int incrementAndCount(String key) {
    long now = System.currentTimeMillis();
    Deque<Long> d = buckets.computeIfAbsent(key, k -> new ArrayDeque<>());
    synchronized (d) {
      d.addLast(now);
      trim(d, now);
      return d.size();
    }
  }

  public int count(String key) {
    long now = System.currentTimeMillis();
    Deque<Long> d = buckets.get(key);
    if (d == null) {
      return 0;
    }
    synchronized (d) {
      trim(d, now);
      return d.size();
    }
  }

  private void trim(Deque<Long> d, long now) {
    while (!d.isEmpty() && now - d.peekFirst() > windowMs) {
      d.pollFirst();
    }
  }
}
