package com.smrms.smrms.security;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org. springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto. bcrypt.BCryptPasswordEncoder;
import org.springframework.security. crypto.password.PasswordEncoder;
import org.springframework.security. web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors. UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final com.smrms.smrms.security.service.CustomUserDetailsService customUserDetailsService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 🔒 Disable CSRF for SPA + JWT
                .csrf(csrf -> csrf.disable())

                // 🌐 Allow frontend (Vite) connection
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 🚦 Authorization rules
                .authorizeHttpRequests(auth -> auth
                        . requestMatchers(
                                "/api/auth/**",     // Local login/register
                                "/oauth2/**",       // Google OAuth2 endpoints
                                "/login/**",
                                "/error",
                                "/api/public/**"
                        ).permitAll()

                        // Staff-only API space (both ADMIN & MAINTENANCE_STAFF)
                        .requestMatchers("/api/staff/**"). hasAnyRole("ADMIN","MAINTENANCE_STAFF")

                        // Admin-only management APIs
                        .requestMatchers("/api/students/**").hasRole("ADMIN")

                        // Everything else needs authentication
                        .anyRequest().authenticated()
                )

                // ⛔ For /api/** without token, return 401 instead of redirecting to Google
                .exceptionHandling(ex -> ex. authenticationEntryPoint((req, res, e) -> {
                    if (req.getRequestURI().startsWith("/api/")) {
                        res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                    } else {
                        res.sendRedirect("/login");
                    }
                }))

                // 🔑 OAuth2 (Google login)
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oAuth2SuccessHandler)
                        .failureUrl("https://frontend-production-e168.up. railway.app/login?error=true")
                )

                // 🪶 JWT only → no HTTP session
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // ⚙️ Local authentication provider (for LOCAL users)
                .authenticationProvider(authenticationProvider())

                // 🧩 Add JWT filter before username/password filter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ✅ Local authentication provider (for LOCAL login)
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    // ✅ Authentication manager (used in AuthService)
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // ✅ BCrypt encoder for password hashing
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ✅ CORS setup: allow BOTH localhost AND Railway production
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // 🔥 Allow BOTH localhost (dev) AND Railway (production)
        config.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",                                    // Local dev
                "http://localhost:3000",                                    // Alternative local
                "https://frontend-production-e168.up.railway.app"          // 🚀 Production
        ));

        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "*"));
        config.setAllowCredentials(true);
        config.setExposedHeaders(Arrays.asList("Authorization"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}