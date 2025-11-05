package com.smrms.smrms.security;

import com.smrms.smrms.entity.Role;
import com.smrms.smrms.entity.User;
import com.smrms.smrms.entity.UserRole;
import com.smrms.smrms.repository.RoleRepository;
import com.smrms.smrms.repository.UserRepository;
import com.smrms.smrms.repository.UserRoleRepository;
import com.smrms.smrms.security.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Transactional
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final JwtService jwtService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oAuthUser = (OAuth2User) authentication.getPrincipal();

        // ✅ Safely extract user info from Google
        String email = oAuthUser.getAttribute("email");
        String displayName = oAuthUser.getAttribute("name");

        if (displayName == null || displayName.isBlank()) {
            String givenName = oAuthUser.getAttribute("given_name");
            String familyName = oAuthUser.getAttribute("family_name");
            displayName = (givenName != null ? givenName : "") + " " + (familyName != null ? familyName : "");
            displayName = displayName.trim().isEmpty() ? "Google User" : displayName.trim();
        }

        if (email == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Google did not return an email address.");
            return;
        }

        final String finalDisplayName = displayName;

        // ✅ Check if user already exists
        User user = userRepository.findByEmail(email).orElse(null);

        // ✅ Create new user if doesn't exist
        if (user == null) {
            user = User.builder()
                    .id(UUID.randomUUID().toString())
                    .fullname(finalDisplayName)
                    .email(email)
                    .authMethod("GOOGLE")
                    .password("") // no password for OAuth users
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .build();

            userRepository.save(user);
        }

        // ✅ Assign Student role if none exists
        if (userRoleRepository.findByUser(user).isEmpty()) {
            Role role = roleRepository.findByRoleName("Student")
                    .orElseGet(() -> roleRepository.save(
                            Role.builder()
                                    .roleName("Student")
                                    .roleCreatedAt(LocalDateTime.now())
                                    .build()
                    ));

            userRoleRepository.save(UserRole.builder()
                    .user(user)
                    .role(role)
                    .userRoleCreatedAt(LocalDateTime.now())
                    .build());
        }

        // ✅ Generate JWT token
        String token = jwtService.generateToken(email, Collections.emptyMap());

        // ✅ Redirect to React frontend with token
        response.sendRedirect("http://localhost:5173/buildings?token=" + token);
    }
}
