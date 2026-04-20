package com.resqmeal.security;

import com.resqmeal.config.SecurityMonitoringProperties;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.core.Ordered;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Locale;
import java.util.Set;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter implements Ordered {

  public static final int ORDER = 120;
  private static final Set<String> ALLOWED_APP_ROLES = Set.of("restaurant", "ngo", "volunteer");

  private final JwtUtil jwtUtil;
  private final SecurityMonitoringProperties securityMonitoringProperties;

  public JwtAuthenticationFilter(
      JwtUtil jwtUtil, SecurityMonitoringProperties securityMonitoringProperties) {
    this.jwtUtil = jwtUtil;
    this.securityMonitoringProperties = securityMonitoringProperties;
  }

  @Override
  public int getOrder() {
    return ORDER;
  }

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain) throws ServletException, IOException {
    String header = request.getHeader(HttpHeaders.AUTHORIZATION);
    if (header != null && header.startsWith("Bearer ")) {
      String token = header.substring(7);
      try {
        var claims = jwtUtil.parse(token);
        Long id = claims.get("id", Long.class);
        if (id == null && claims.getSubject() != null) {
          id = Long.parseLong(claims.getSubject());
        }
        String role = claims.get("role", String.class);
        String normalizedRole = normalizeRole(role);
        if (id != null && normalizedRole != null) {
          var principal = new AuthPrincipal(id, normalizedRole);
          var authorities = new ArrayList<SimpleGrantedAuthority>();
          authorities.add(
              new SimpleGrantedAuthority("ROLE_" + normalizedRole.toUpperCase(Locale.ROOT)));
          if (securityMonitoringProperties.getAdminUserIds() != null
              && securityMonitoringProperties.getAdminUserIds().contains(id)) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
          }
          var auth =
              new UsernamePasswordAuthenticationToken(principal, null, authorities);
          SecurityContextHolder.getContext().setAuthentication(auth);
        }
      } catch (JwtException | IllegalArgumentException ignored) {
        SecurityContextHolder.clearContext();
      }
    }
    filterChain.doFilter(request, response);
  }

  private static String normalizeRole(String rawRole) {
    if (rawRole == null || rawRole.isBlank()) {
      return null;
    }
    String normalized = rawRole.trim().toLowerCase(Locale.ROOT);
    return ALLOWED_APP_ROLES.contains(normalized) ? normalized : null;
  }
}
