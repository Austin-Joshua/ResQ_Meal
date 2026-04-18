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
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter implements Ordered {

  public static final int ORDER = 120;

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
        if (id != null && role != null) {
          var principal = new AuthPrincipal(id, role);
          var authorities = new ArrayList<SimpleGrantedAuthority>();
          authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
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
}
