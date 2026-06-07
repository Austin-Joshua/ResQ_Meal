package com.resqmeal.scheduler;

import com.resqmeal.service.TokenBlacklistService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class CleanupScheduler {

  private static final Logger log = LoggerFactory.getLogger(CleanupScheduler.class);

  private final TokenBlacklistService tokenBlacklistService;

  public CleanupScheduler(TokenBlacklistService tokenBlacklistService) {
    this.tokenBlacklistService = tokenBlacklistService;
  }

  @Scheduled(fixedRate = 3_600_000)
  public void purgeExpiredTokens() {
    int removed = tokenBlacklistService.purgeExpired();
    if (removed > 0) {
      log.debug("Purged {} expired token(s) from blacklist", removed);
    }
  }
}
