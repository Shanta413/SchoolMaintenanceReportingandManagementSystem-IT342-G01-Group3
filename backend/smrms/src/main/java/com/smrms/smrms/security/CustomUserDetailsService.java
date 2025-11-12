package com.smrms.smrms.security.service;

import com.smrms.smrms.entity.User;
import com.smrms.smrms.repository.UserRepository;
import com.smrms.smrms.repository.UserRoleRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;

    public CustomUserDetailsService(UserRepository userRepository,
                                    UserRoleRepository userRoleRepository) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // 🔍 Find user by email
        User u = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        // 🧩 Build authorities from roles
        var authorities = userRoleRepository.findByUser(u).stream()
                .map(ur -> new SimpleGrantedAuthority("ROLE_" + ur.getRole().getRoleName()))
                .collect(Collectors.toSet());

        // ⚙️ Handle Google users with no password
        String password = u.getPassword() != null ? u.getPassword() : "{noop}GOOGLE_USER_NO_PASSWORD";

        // ✅ Return Spring Security User object
        return org.springframework.security.core.userdetails.User
                .withUsername(u.getEmail())
                .password(password) // must not be null
                .authorities(authorities)
                .accountLocked(!u.isActive())
                .build();
    }
}
