package com.smrms.smrms.repository;

import com.smrms.smrms.entity.OAuth;
import com.smrms.smrms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OAuthRepository extends JpaRepository<OAuth, String> {
    Optional<OAuth> findByUser(User user);
}
