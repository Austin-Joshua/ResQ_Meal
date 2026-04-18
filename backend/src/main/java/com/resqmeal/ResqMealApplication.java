package com.resqmeal;

import com.resqmeal.config.SecurityMonitoringProperties;
import com.resqmeal.config.TrafficSecurityProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
@EnableConfigurationProperties({SecurityMonitoringProperties.class, TrafficSecurityProperties.class})
public class ResqMealApplication {

  public static void main(String[] args) {
    SpringApplication.run(ResqMealApplication.class, args);
  }
}
