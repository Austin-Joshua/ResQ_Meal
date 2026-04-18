package com.resqmeal.config;

import io.netty.channel.ChannelOption;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Configuration
public class TrafficSecurityClientConfig {

  @Bean
  WebClient trafficSecurityWebClient(TrafficSecurityProperties props) {
    HttpClient httpClient =
        HttpClient.create()
            .responseTimeout(Duration.ofMillis(props.getReadTimeoutMs()))
            .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, props.getConnectTimeoutMs());
    return WebClient.builder()
        .baseUrl(props.getMlServiceBaseUrl().replaceAll("/$", ""))
        .clientConnector(new ReactorClientHttpConnector(httpClient))
        .build();
  }
}
