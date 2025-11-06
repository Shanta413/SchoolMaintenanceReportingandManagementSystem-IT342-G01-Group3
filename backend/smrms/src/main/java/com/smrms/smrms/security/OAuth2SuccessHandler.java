package com.smrms.smrms.security;

import com.smrms.smrms.entity.*;
import com.smrms.smrms.repository.*;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * ✅ Handles Google OAuth2 logins:
 * - Creates user if new
 * - Keeps LOCAL users unchanged
 * - Uploads Google avatar once to Supabase storage
 * - Assigns STUDENT role and Student record
 * - Redirects frontend with JWT token
 */
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final StudentRepository studentRepository;
    private final JwtService jwtService;

    // 🔹 Your Supabase Storage info
    private static final String SUPABASE_URL = "https://<YOUR-SUPABASE-PROJECT>.supabase.co";
    private static final String SUPABASE_BUCKET = "avatars";
    private static final String SUPABASE_API_KEY = "<YOUR-SUPABASE-ANON-KEY>";

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture"); // Google profile photo

        if (email == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "No email from Google account");
            return;
        }

        // 🔍 Find or create user by email
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

        // 🧩 Prevent overwriting local users
        if ("LOCAL".equalsIgnoreCase(user.getAuthMethod())) {
            System.out.println("🟡 Existing LOCAL user tried Google login — skipping update.");
        } else if ("GOOGLE".equalsIgnoreCase(user.getAuthMethod())) {
            // 🟢 Upload Google avatar only once
            if ((user.getAvatarUrl() == null || user.getAvatarUrl().isBlank()) && picture != null) {
                try {
                    String supabaseUrl = uploadImageToSupabase(picture);
                    if (supabaseUrl != null) {
                        user.setAvatarUrl(supabaseUrl);
                        userRepository.save(user);
                        System.out.println("✅ Uploaded Google avatar to Supabase: " + supabaseUrl);
                    }
                } catch (Exception e) {
                    System.err.println("⚠️ Failed to upload Google avatar to Supabase: " + e.getMessage());
                }
            }
        }

        // 🧱 Ensure STUDENT role exists
        Role studentRole = roleRepository.findByRoleName("STUDENT")
                .orElseGet(() -> roleRepository.save(
                        Role.builder()
                                .roleName("STUDENT")
                                .roleCreatedAt(LocalDateTime.now())
                                .build()
                ));

        // 🔗 Assign role if missing
        if (!userRoleRepository.existsByUserAndRole(user, studentRole)) {
            userRoleRepository.save(UserRole.builder()
                    .user(user)
                    .role(studentRole)
                    .userRoleCreatedAt(LocalDateTime.now())
                    .build());
        }

        // 🧍 Create student profile if missing
        studentRepository.findByUser(user).orElseGet(() -> {
            Student student = Student.builder()
                    .user(user)
                    .studentDepartment("BSIT") // optional default
                    .studentIdNumber(null)
                    .build();
            return studentRepository.save(student);
        });

        // 🔑 Generate JWT token
        String token = jwtService.generateToken(email);

        // 🔁 Redirect to frontend with JWT
        response.sendRedirect("http://localhost:5173/login?token=" + token);
    }

    /**
     * 🔧 Downloads an image from a Google URL and uploads it to Supabase storage.
     * Returns the public Supabase URL.
     */
    private String uploadImageToSupabase(String imageUrl) throws IOException {
        // 1️⃣ Download Google image
        URL url = new URL(imageUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");
        connection.setConnectTimeout(5000);
        connection.setReadTimeout(5000);

        if (connection.getResponseCode() != 200) {
            throw new IOException("Failed to download Google image (HTTP " + connection.getResponseCode() + ")");
        }

        byte[] imageBytes;
        try (InputStream inputStream = connection.getInputStream();
             ByteArrayOutputStream buffer = new ByteArrayOutputStream()) {
            byte[] data = new byte[4096];
            int n;
            while ((n = inputStream.read(data)) != -1) {
                buffer.write(data, 0, n);
            }
            imageBytes = buffer.toByteArray();
        }

        // 2️⃣ Upload to Supabase via REST API
        String fileName = UUID.randomUUID() + ".jpg";
        URL uploadUrl = new URL(SUPABASE_URL + "/storage/v1/object/" + SUPABASE_BUCKET + "/" + fileName);

        HttpURLConnection uploadConn = (HttpURLConnection) uploadUrl.openConnection();
        uploadConn.setRequestMethod("POST");
        uploadConn.setDoOutput(true);
        uploadConn.setRequestProperty("Authorization", "Bearer " + SUPABASE_API_KEY);
        uploadConn.setRequestProperty("Content-Type", "image/jpeg");
        uploadConn.setRequestProperty("x-upsert", "true");

        try (OutputStream os = uploadConn.getOutputStream()) {
            os.write(imageBytes);
        }

        int uploadCode = uploadConn.getResponseCode();
        if (uploadCode != 200 && uploadCode != 201) {
            throw new IOException("Supabase upload failed (HTTP " + uploadCode + ")");
        }

        // 3️⃣ Return public URL
        return SUPABASE_URL + "/storage/v1/object/public/" + SUPABASE_BUCKET + "/" + fileName;
    }
}
