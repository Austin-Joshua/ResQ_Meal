package com.resqmeal.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.util.matcher.RequestMatcher;

/**
 * Allows GET requests for the SPA (non-API, non-upload) so direct navigation works when the
 * browser loads the packaged {@code index.html}.
 */
public class SpaRequestMatcher implements RequestMatcher {

  @Override
  public boolean matches(HttpServletRequest request) {
    if (!HttpMethod.GET.matches(request.getMethod())) {
      return false;
    }
    String p = request.getRequestURI();
    if (p.startsWith("/api") || p.startsWith("/uploads")) {
      return false;
    }
    if (p.contains(".")) {
      return p.endsWith(".html")
          || p.startsWith("/assets/")
          || p.endsWith(".ico")
          || p.endsWith(".txt")
          || p.endsWith(".png")
          || p.endsWith(".svg")
          || p.endsWith(".webmanifest");
    }
    return true;
  }
}
