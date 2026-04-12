package com.resqmeal.config;

import com.resqmeal.security.JwtAuthenticationFilter;
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

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

  private final JwtAuthenticationFilter jwtAuthenticationFilter;

  public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
    this.jwtAuthenticationFilter = jwtAuthenticationFilter;
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.csrf(csrf -> csrf.disable())
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
                    .requestMatchers(new SpaRequestMatcher())
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}
