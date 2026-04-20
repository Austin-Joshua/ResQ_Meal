package com.resqmeal;

import com.resqmeal.config.SecurityMonitoringProperties;
import com.resqmeal.config.TrafficSecurityProperties;
import com.resqmeal.config.AttackSimulationProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
@EnableScheduling
@EnableConfigurationProperties({
  SecurityMonitoringProperties.class,
  TrafficSecurityProperties.class,
  AttackSimulationProperties.class
})
public class ResqMealApplication {

  public static void main(String[] args) {
    SpringApplication.run(ResqMealApplication.class, args);
  }
}
