package com.resqmeal.config;

import com.resqmeal.security.IpBlockFilter;
import com.resqmeal.security.SecurityMonitoringFilter;
import com.resqmeal.security.TrafficCaptureFilter;
import com.resqmeal.service.BlockedEntityRegistry;
import com.resqmeal.service.SecurityMonitoringService;
import com.resqmeal.service.TrafficThreatAnalysisService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SecurityFilterBeans {

  @Bean
  TrafficCaptureFilter trafficCaptureFilter(
      TrafficSecurityProperties trafficSecurityProperties,
      TrafficThreatAnalysisService trafficThreatAnalysisService) {
    return new TrafficCaptureFilter(trafficSecurityProperties, trafficThreatAnalysisService);
  }

  @Bean
  IpBlockFilter ipBlockFilter(BlockedEntityRegistry blockedEntityRegistry) {
    return new IpBlockFilter(blockedEntityRegistry);
  }

  @Bean
  SecurityMonitoringFilter securityMonitoringFilter(
      SecurityMonitoringService securityMonitoringService,
      BlockedEntityRegistry blockedEntityRegistry) {
    return new SecurityMonitoringFilter(securityMonitoringService, blockedEntityRegistry);
  }
}
