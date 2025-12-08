package com.smrms.smrms.security;

import com.smrms.smrms.entity.Role;
import com.smrms.smrms.smrms.entity.Student;
import com.smrms.smrms.entity.User;
import com.smrms.smrms.entity.UserRole;
import com.smrms.smrms.repository.RoleRepository;
import com.smrms.smrms.repository.StudentRepository;
import com.smrms.smrms.repository.UserRepository;
import com.smrms.smrms.repository.UserRoleRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Handles Google OAuth2 logins:
 * Automatically supports LOCAL and PRODUCTION redirect
 */
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final StudentRepository studentRepository;
    private final JwtService jwtService;

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.bucket}")
    private String supabaseBucket;

    @Value("${supabase.service_key}")
    private String supabaseServiceKey;

    // Read prod frontend from env variable
    @Value("${frontend.url:https://frontend-production-e168.up.railway.app/login}")
    private String frontendProdUrl; 
    // fallback already set in annotation

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email   = oAuth2User.getAttribute("email");
        String name    = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        if (email == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Google account returned no email");
            return;
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .fullname(name)
                    .email(email)
                    .password(null)
                    .authMethod("GOOGLE")
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .build();
            return userRepository.save(newUser);
        });

        // Upload avatar once
        if ((user.getAvatarUrl() == null || user.getAvatarUrl().isBlank()) && picture != null) {
            try {
                String uploadedUrl = uploadImageToSupabase(picture);
                user.setAvatarUrl(uploadedUrl);
                userRepository.save(user);
            } catch (Exception ignored) {
                user.setAvatarUrl(picture);
                userRepository.save(user);
            }
        }

        // Assign STUDENT role if missing
        Role studentRole = roleRepository.findByRoleName("STUDENT")
                .orElseGet(() -> roleRepository.save(
                        Role.builder()
                                .roleName("STUDENT")
                                .roleCreatedAt(LocalDateTime.now())
                                .build()
                ));

        if (!userRoleRepository.existsByUserAndRole(user, studentRole)) {
            userRoleRepository.save(
                    UserRole.builder()
                            .user(user)
                            .role(studentRole)
                            .userRoleCreatedAt(LocalDateTime.now())
                            .build()
            );
        }

        // Ensure student record
        studentRepository.findByUser(user).orElseGet(() ->
                studentRepository.save(
                        Student.builder()
                                .user(user)
                                .studentDepartment("null")
                                .studentIdNumber(null)
                                .build()
                )
        );

        // issue JWT
        String token = jwtService.generateToken(email);

        String roleName = userRoleRepository.findByUser(user)
                .map(ur -> ur.getRole().getRoleName())
                .orElse("STUDENT");

        /* 🌍 SMART REDIRECT LOGIC (LOCAL OR PRODUCTION) */
        String requestHost = request.getServerName();
        String redirectUrl;

        if (requestHost.equals("localhost") || requestHost.equals("127.0.0.1")) {
            redirectUrl = "http://localhost:5173/login";
        } else {
            redirectUrl = frontendProdUrl; // read from Railway env
        }

        String finalRedirect = redirectUrl + "?token=" + token + "&role=" + roleName;

        response.sendRedirect(finalRedirect);
    }

    private String uploadImageToSupabase(String imageUrl) throws IOException {
        URL url = new URL(imageUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setConnectTimeout(8000);
        connection.setReadTimeout(8000);
        connection.setRequestMethod("GET");
        connection.setInstanceFollowRedirects(true);
        connection.setRequestProperty("User-Agent", "SMRMS/1.0");

        byte[] downloadedBytes;
        try (InputStream in = connection.getInputStream();
             ByteArrayOutputStream buffer = new ByteArrayOutputStream()) {
            byte[] data = new byte[8192];
            int len;
            while ((len = in.read(data)) > 0) buffer.write(data, 0, len);
            downloadedBytes = buffer.toByteArray();
        }

        String fileName = UUID.randomUUID() + ".jpg";
        URL uploadUrl = new URL(supabaseUrl + "/storage/v1/object/" + supabaseBucket + "/" + fileName);

        HttpURLConnection uploadConn = (HttpURLConnection) uploadUrl.openConnection();
        uploadConn.setRequestMethod("POST");
        uploadConn.setRequestProperty("Authorization", "Bearer " + supabaseServiceKey);
        uploadConn.setRequestProperty("apikey", supabaseServiceKey);
        uploadConn.setRequestProperty("Content-Type", "image/jpeg");
        uploadConn.setRequestProperty("x-upsert", "true");
        uploadConn.setDoOutput(true);

        try (OutputStream os = uploadConn.getOutputStream()) {
            os.write(downloadedBytes);
        }

        return supabaseUrl + "/storage/v1/object/public/" + supabaseBucket + "/" + fileName;
    }
}
