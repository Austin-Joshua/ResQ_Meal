package com.resqmeal.config;

import com.resqmeal.security.IpBlockFilter;
import com.resqmeal.security.JwtAuthenticationFilter;
import com.resqmeal.security.SecurityMonitoringFilter;
import com.resqmeal.security.TrafficCaptureFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.Customizer;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

  private final JwtAuthenticationFilter jwtAuthenticationFilter;
  private final IpBlockFilter ipBlockFilter;
  private final TrafficCaptureFilter trafficCaptureFilter;
  private final SecurityMonitoringFilter securityMonitoringFilter;

  public SecurityConfig(
      JwtAuthenticationFilter jwtAuthenticationFilter,
      IpBlockFilter ipBlockFilter,
      TrafficCaptureFilter trafficCaptureFilter,
      SecurityMonitoringFilter securityMonitoringFilter) {
    this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    this.ipBlockFilter = ipBlockFilter;
    this.trafficCaptureFilter = trafficCaptureFilter;
    this.securityMonitoringFilter = securityMonitoringFilter;
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .exceptionHandling(
            e ->
                e.authenticationEntryPoint(
                    (request, response, authException) -> {
                      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                      response.setContentType("application/json");
                      response.getWriter().write("{\"error\":\"Unauthorized\"}");
                    }))
        .authorizeHttpRequests(
            auth ->
                auth.requestMatchers(HttpMethod.GET, "/api/health")
                    .permitAll()
                    .requestMatchers(HttpMethod.OPTIONS, "/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/register")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/food/available/all")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/impact/global", "/api/impact/timeline")
                    .permitAll()
                    .requestMatchers(
                        HttpMethod.GET, "/api/ngos/{id:[0-9]+}", "/api/ngos/{id:[0-9]+}/capacity")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/matches/{id:[0-9]+}")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/food/{id:[0-9]+}")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/ai/health")
                    .permitAll()
                    .requestMatchers("/uploads/**")
                    .permitAll()
                    .requestMatchers("/api/admin/**")
                    .hasRole("ADMIN")
                    .requestMatchers(new SpaRequestMatcher())
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .addFilterBefore(ipBlockFilter, UsernamePasswordAuthenticationFilter.class)
        .addFilterAfter(trafficCaptureFilter, IpBlockFilter.class)
        .addFilterAfter(jwtAuthenticationFilter, TrafficCaptureFilter.class)
        .addFilterAfter(securityMonitoringFilter, JwtAuthenticationFilter.class);
    return http.build();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}
