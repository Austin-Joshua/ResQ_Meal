package com.resqmeal.controller;

import com.resqmeal.service.NgoService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
  public ResponseEntity<?> get(@PathVariable long id) {
    Map<String, Object> n = ngoService.getNgo(id);
    if (n == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(n);
  }

  @PutMapping("/{id:[0-9]+}")
  @Operation(summary = "Update an NGO profile")
  public ResponseEntity<?> update(@PathVariable long id, @RequestBody Map<String, Object> body) {
    return ResponseEntity.ok(ngoService.updateNgo(id, body));
  }

  @GetMapping("/{id:[0-9]+}/capacity")
  @Operation(summary = "Get NGO capacity details")
  public ResponseEntity<?> capacity(@PathVariable long id) {
    Map<String, Object> c = ngoService.capacity(id);
    if (c == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(c);
  }

  @PostMapping("/{id:[0-9]+}/capacity/update")
  @Operation(summary = "Update NGO capacity quantity")
  public ResponseEntity<?> updateCapacity(@PathVariable long id, @RequestBody Map<String, Object> body) {
    int qty = ((Number) body.get("quantity")).intValue();
    if (qty <= 0) {
      return ResponseEntity.badRequest().body(Map.of("error", "Invalid quantity"));
    }
    return ResponseEntity.ok(ngoService.updateCapacity(id, qty));
  }
}
