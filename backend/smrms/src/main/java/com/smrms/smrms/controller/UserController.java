package com.smrms.smrms.controller;

import com.smrms.smrms.dto.ProfileResponse;
import com.smrms.smrms.dto.ProfileUpdateRequest;
import com.smrms.smrms.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    public UserController(UserService userService) { this.userService = userService; }

    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getProfile(@AuthenticationPrincipal UserDetails principal) {
        // ✅ Match service method name exactly
        return ResponseEntity.ok(userService.getUserProfile(principal.getUsername()));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserDetails principal,
                                           @RequestBody ProfileUpdateRequest req) {
        userService.updateProfile(principal.getUsername(), req);
        return ResponseEntity.ok().build();
    }
}
