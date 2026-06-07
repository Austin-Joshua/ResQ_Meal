package com.resqmeal.controller;

import com.resqmeal.common.ApiResponse;
import com.resqmeal.exception.UnauthorizedException;
import com.resqmeal.security.AuthPrincipal;
import com.resqmeal.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@Validated
@Tag(name = "Uploads", description = "File uploads")
public class UploadController {

  private final UserService userService;

  public UploadController(UserService userService) {
    this.userService = userService;
  }

  @PostMapping("/profile-photo")
  @Operation(summary = "Upload a profile photo for the authenticated user")
  public ResponseEntity<ApiResponse<Map<String, Object>>> profilePhoto(
      @AuthenticationPrincipal AuthPrincipal user, @RequestParam("photo") MultipartFile file) {
    if (user == null) {
      throw new UnauthorizedException("Access token required");
    }
    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("No file uploaded. Please provide an image.");
    }
    try {
      return ApiResponse.okEntity(
          userService.uploadProfilePhoto(user.id(), file.getBytes(), file.getOriginalFilename()));
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload profile photo");
    }
  }
}
