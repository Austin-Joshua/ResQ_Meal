package com.resqmeal.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

  @Override
  public void addCorsMappings(@NonNull CorsRegistry registry) {
    registry
        .addMapping("/**")
        .allowedOriginPatterns(
            "http://localhost:*",
            "http://127.0.0.1:*",
            // Vite “Network” URL and LAN testing when VITE_API_URL points at this machine
            "http://192.168.*:*",
            "http://10.*:*",
            "http://172.31.*:*",
            "http://172.29.*:*")
        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        .allowedHeaders("*")
        .allowCredentials(true);
  }
}
