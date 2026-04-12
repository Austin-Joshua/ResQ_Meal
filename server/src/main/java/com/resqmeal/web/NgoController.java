package com.resqmeal.web;

import com.resqmeal.service.NgoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ngos")
public class NgoController {

  private final NgoService ngoService;

  public NgoController(NgoService ngoService) {
    this.ngoService = ngoService;
  }

  @GetMapping("/{id:[0-9]+}")
  public ResponseEntity<?> get(@PathVariable long id) {
    Map<String, Object> n = ngoService.getNgo(id);
    if (n == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(n);
  }

  @PutMapping("/{id:[0-9]+}")
  public ResponseEntity<?> update(@PathVariable long id, @RequestBody Map<String, Object> body) {
    return ResponseEntity.ok(ngoService.updateNgo(id, body));
  }

  @GetMapping("/{id:[0-9]+}/capacity")
  public ResponseEntity<?> capacity(@PathVariable long id) {
    Map<String, Object> c = ngoService.capacity(id);
    if (c == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(c);
  }

  @PostMapping("/{id:[0-9]+}/capacity/update")
  public ResponseEntity<?> updateCapacity(@PathVariable long id, @RequestBody Map<String, Object> body) {
    int qty = ((Number) body.get("quantity")).intValue();
    if (qty <= 0) {
      return ResponseEntity.badRequest().body(Map.of("error", "Invalid quantity"));
    }
    return ResponseEntity.ok(ngoService.updateCapacity(id, qty));
  }
}
