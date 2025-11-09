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
 * - Creates user if new
 * - Keeps LOCAL users unchanged
 * - Uploads Google avatar to Supabase (server-side, service role)
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

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email   = oAuth2User.getAttribute("email");
        String name    = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture"); // Google profile photo

        if (email == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "No email from Google account");
            return;
        }

        // find-or-create user by email
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

        // don't overwrite LOCAL users
        if ("GOOGLE".equalsIgnoreCase(user.getAuthMethod())) {
            // upload Google avatar once
            if ((user.getAvatarUrl() == null || user.getAvatarUrl().isBlank()) && picture != null) {
                try {
                    String uploadedUrl = uploadImageToSupabase(picture);
                    user.setAvatarUrl(uploadedUrl);
                } catch (Exception e) {
                    // fallback to Google URL so UI still shows an image
                    user.setAvatarUrl(picture);
                    System.err.println("Avatar upload failed, using Google picture URL. Reason: " + e.getMessage());
                }
                userRepository.save(user);
            }
        }

        // ensure STUDENT role exists
        Role studentRole = roleRepository.findByRoleName("STUDENT")
                .orElseGet(() -> roleRepository.save(
                        Role.builder()
                                .roleName("STUDENT")
                                .roleCreatedAt(LocalDateTime.now())
                                .build()
                ));

        // assign STUDENT role if missing
        if (!userRoleRepository.existsByUserAndRole(user, studentRole)) {
            userRoleRepository.save(UserRole.builder()
                    .user(user)
                    .role(studentRole)
                    .userRoleCreatedAt(LocalDateTime.now())
                    .build());
        }

        // create student profile if missing
        studentRepository.findByUser(user).orElseGet(() -> {
            Student student = Student.builder()
                    .user(user)
                    .studentDepartment("BSIT") // optional default
                    .studentIdNumber(null)
                    .build();
            return studentRepository.save(student);
        });

        // JWT + role
        String token = jwtService.generateToken(email);
        String roleName = userRoleRepository.findByUser(user)
                .map(ur -> ur.getRole().getRoleName())
                .orElse("STUDENT");

        // redirect back to frontend with token + role
        response.sendRedirect("http://localhost:5173/login?token=" + token + "&role=" + roleName);
    }

    /**
     * Downloads an image from Google and uploads it to Supabase Storage.
     * Returns the public Supabase URL.
     */
    private String uploadImageToSupabase(String imageUrl) throws IOException {
        // 1) download from Google (handle redirects)
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

        // 2) upload to Supabase (service role)
        String fileName = UUID.randomUUID() + ".jpg";
        URL uploadUrl = new URL(supabaseUrl + "/storage/v1/object/" + supabaseBucket + "/" + fileName);

        HttpURLConnection uploadConn = (HttpURLConnection) uploadUrl.openConnection();
        uploadConn.setRequestMethod("POST");
        uploadConn.setDoOutput(true);
        uploadConn.setConnectTimeout(8000);
        uploadConn.setReadTimeout(8000);

        // both headers are required by Supabase Storage REST
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

        // 3) public URL (bucket must be public)
        return supabaseUrl + "/storage/v1/object/public/" + supabaseBucket + "/" + fileName;
    }
}
