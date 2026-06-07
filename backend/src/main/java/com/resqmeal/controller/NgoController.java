package com.resqmeal.controller;

import com.resqmeal.common.ApiResponse;
import com.resqmeal.exception.ResourceNotFoundException;
import com.resqmeal.service.NgoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ngos")
@Validated
@Tag(name = "NGOs", description = "NGO profiles and capacity")
public class NgoController {

  private final NgoService ngoService;

  public NgoController(NgoService ngoService) {
    this.ngoService = ngoService;
  }

  @GetMapping("/{id:[0-9]+}")
  @Operation(summary = "Get an NGO profile by ID")
  public ResponseEntity<ApiResponse<Map<String, Object>>> get(@PathVariable long id) {
    Map<String, Object> n = ngoService.getNgo(id);
    if (n == null) {
      throw new ResourceNotFoundException("NGO not found");
    }
    return ApiResponse.okEntity(n);
  }

  @PutMapping("/{id:[0-9]+}")
  @Operation(summary = "Update an NGO profile")
  public ResponseEntity<ApiResponse<Map<String, Object>>> update(
      @PathVariable long id, @RequestBody Map<String, Object> body) {
    return ApiResponse.okEntity(ngoService.updateNgo(id, body));
  }

  @GetMapping("/{id:[0-9]+}/capacity")
  @Operation(summary = "Get NGO capacity details")
  public ResponseEntity<ApiResponse<Map<String, Object>>> capacity(@PathVariable long id) {
    Map<String, Object> c = ngoService.capacity(id);
    if (c == null) {
      throw new ResourceNotFoundException("NGO capacity not found");
    }
    return ApiResponse.okEntity(c);
  }

  @PostMapping("/{id:[0-9]+}/capacity/update")
  @Operation(summary = "Update NGO capacity quantity")
  public ResponseEntity<ApiResponse<Map<String, Object>>> updateCapacity(
      @PathVariable long id, @RequestBody Map<String, Object> body) {
    int qty = ((Number) body.get("quantity")).intValue();
    if (qty <= 0) {
      throw new IllegalArgumentException("Invalid quantity");
    }
    return ApiResponse.okEntity(ngoService.updateCapacity(id, qty));
  }
}
