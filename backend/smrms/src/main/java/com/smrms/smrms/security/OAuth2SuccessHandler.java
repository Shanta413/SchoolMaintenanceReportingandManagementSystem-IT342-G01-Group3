package com.smrms.smrms.security;

import com.smrms.smrms.entity.Role;
import com.smrms.smrms.entity.Student;
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
 * - Creates user if new (but does NOT change existing LOCAL accounts)
 * - Uploads Google avatar ONCE to Supabase if user has no avatar yet
 * - Ensures STUDENT role + Student record
 * - Redirects frontend with JWT + role
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

    // SERVICE ROLE key (backend only). Do NOT expose on frontend.
    @Value("${supabase.service_key}")
    private String supabaseServiceKey;

    // Change this if your frontend base URL differs in prod
    private static final String FRONTEND_LOGIN_REDIRECT = "https://frontend-production-e168.up.railway.app/login";

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email   = oAuth2User.getAttribute("email");
        String name    = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture"); // Google profile photo URL

        if (email == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "No email from Google account");
            return;
        }

        // Find or create user by email.
        // If an existing LOCAL user logs in with Google (same email), we DO NOT flip authMethod.
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .fullname(name)
                    .email(email)
                    .password(null)              // Google users have no local password
                    .authMethod("GOOGLE")
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .build();
            return userRepository.save(newUser);
        });

        // Upload avatar exactly once if missing, regardless of auth method (LOCAL or GOOGLE).
        // This guarantees: once the user has an avatar (e.g., set via Profile page),
        // future Google logins won't overwrite it.
        if ((user.getAvatarUrl() == null || user.getAvatarUrl().isBlank()) && picture != null) {
            try {
                String uploadedUrl = uploadImageToSupabase(picture);
                user.setAvatarUrl(uploadedUrl);
                System.out.println("✅ Avatar uploaded to Supabase: " + uploadedUrl);
            } catch (Exception e) {
                // Only fallback to Google picture if we STILL have no avatar
                if (user.getAvatarUrl() == null || user.getAvatarUrl().isBlank()) {
                    user.setAvatarUrl(picture);
                }
                System.err.println("⚠️ Avatar upload failed, using Google picture URL. Reason: " + e.getMessage());
            }
            userRepository.save(user);
        }

        // Ensure STUDENT role exists
        Role studentRole = roleRepository.findByRoleName("STUDENT")
                .orElseGet(() -> roleRepository.save(
                        Role.builder()
                                .roleName("STUDENT")
                                .roleCreatedAt(LocalDateTime.now())
                                .build()
                ));

        // Assign STUDENT role if missing
        if (!userRoleRepository.existsByUserAndRole(user, studentRole)) {
            userRoleRepository.save(UserRole.builder()
                    .user(user)
                    .role(studentRole)
                    .userRoleCreatedAt(LocalDateTime.now())
                    .build());
        }

        // Create student profile if missing
        studentRepository.findByUser(user).orElseGet(() -> {
            Student student = Student.builder()
                    .user(user)
                    .studentDepartment("BSIT") // default, adjust if needed
                    .studentIdNumber(null)
                    .build();
            return studentRepository.save(student);
        });

        // JWT + role
        String token = jwtService.generateToken(email);
        String roleName = userRoleRepository.findByUser(user)
                .map(ur -> ur.getRole().getRoleName())
                .orElse("STUDENT");

        // Redirect back to frontend with token + role
        // (Frontend should ignore any Google "picture" and only use /api/user/profile -> avatarUrl)
        String redirect = FRONTEND_LOGIN_REDIRECT + "?token=" + token + "&role=" + roleName;
        response.sendRedirect(redirect);
    }

    /**
     * Downloads an image from Google and uploads it to Supabase Storage (public bucket).
     * Returns the public Supabase URL.
     */
    private String uploadImageToSupabase(String imageUrl) throws IOException {
        // 1) Download from Google (handle redirects)
        URL url = new URL(imageUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setInstanceFollowRedirects(true);
        connection.setRequestMethod("GET");
        connection.setRequestProperty("User-Agent", "SMRMS/1.0");
        connection.setConnectTimeout(8000);
        connection.setReadTimeout(8000);

        int code = connection.getResponseCode();
        if (code / 100 != 2) {
            throw new IOException("Failed to download Google image (HTTP " + code + ")");
        }

        byte[] imageBytes;
        try (InputStream inputStream = connection.getInputStream();
             ByteArrayOutputStream buffer = new ByteArrayOutputStream()) {
            byte[] data = new byte[8192];
            int n;
            while ((n = inputStream.read(data)) != -1) buffer.write(data, 0, n);
            imageBytes = buffer.toByteArray();
        }

        // 2) Upload to Supabase (service role)
        String fileName = UUID.randomUUID() + ".jpg";
        URL uploadUrl = new URL(supabaseUrl + "/storage/v1/object/" + supabaseBucket + "/" + fileName);

        HttpURLConnection uploadConn = (HttpURLConnection) uploadUrl.openConnection();
        uploadConn.setRequestMethod("POST");
        uploadConn.setDoOutput(true);
        uploadConn.setConnectTimeout(8000);
        uploadConn.setReadTimeout(8000);

        // Required headers for Supabase Storage REST
        uploadConn.setRequestProperty("Authorization", "Bearer " + supabaseServiceKey);
        uploadConn.setRequestProperty("apikey", supabaseServiceKey);
        uploadConn.setRequestProperty("Content-Type", "image/jpeg");
        uploadConn.setRequestProperty("x-upsert", "true");

        try (OutputStream os = uploadConn.getOutputStream()) {
            os.write(imageBytes);
        }

        int uploadCode = uploadConn.getResponseCode();
        if (uploadCode != 200 && uploadCode != 201) {
            InputStream es = uploadConn.getErrorStream();
            String err = "";
            if (es != null) {
                try (es) {
                    err = new String(es.readAllBytes());
                }
            }
            throw new IOException("Supabase upload failed (HTTP " + uploadCode + "): " + err);
        }

        // 3) Public URL (bucket must be public)
        return supabaseUrl + "/storage/v1/object/public/" + supabaseBucket + "/" + fileName;
    }
}
