package com.resqmeal.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.resqmeal.service.SecurityMonitoringService;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;

@Configuration
@EnableCaching
public class RateLimitConfig {

  private static final String RATE_LIMIT_BODY =
      "{\"error\": \"Too many attempts. Try again in 60 seconds.\"}";

  @Bean
  public FilterRegistrationBean<AuthRateLimitFilter> authRateLimitFilterRegistration() {
    FilterRegistrationBean<AuthRateLimitFilter> registration = new FilterRegistrationBean<>();
    registration.setFilter(new AuthRateLimitFilter());
    registration.addUrlPatterns("/api/auth/*");
    registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
    registration.setName("authRateLimitFilter");
    return registration;
  }

  static final class AuthRateLimitFilter extends OncePerRequestFilter {

    private final Cache<String, Bucket> buckets =
        Caffeine.newBuilder()
            .maximumSize(10_000)
            .expireAfterAccess(Duration.ofHours(1))
            .build();

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request,
        @NonNull HttpServletResponse response,
        @NonNull FilterChain filterChain)
        throws ServletException, IOException {
      String ip = SecurityMonitoringService.clientIp(request);
      Bucket bucket =
          buckets.get(
              ip,
              key ->
                  Bucket.builder()
                      .addLimit(
                          Bandwidth.builder()
                              .capacity(5)
                              .refillIntervally(5, Duration.ofSeconds(60))
                              .build())
                      .build());

      if (bucket.tryConsume(1)) {
        filterChain.doFilter(request, response);
        return;
      }

      response.setStatus(429);
      response.setContentType(MediaType.APPLICATION_JSON_VALUE);
      response.getWriter().write(RATE_LIMIT_BODY);
    }
  }
}
