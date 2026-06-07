package com.resqmeal.controller;

import com.resqmeal.common.ApiResponse;
import com.resqmeal.service.ImpactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public")
@Validated
@Tag(name = "Public Impact", description = "Public impact statistics")
public class PublicImpactController {

  private final ImpactService impactService;

  public PublicImpactController(ImpactService impactService) {
    this.impactService = impactService;
  }

  @GetMapping("/impact")
  @Operation(summary = "Public impact statistics")
  @Cacheable("publicImpact")
  public ApiResponse<Map<String, Object>> publicImpact() {
    return ApiResponse.ok(impactService.publicImpact());
  }
}

