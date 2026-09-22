package com.example.todo;

import com.example.todo.entity.Role;
import com.example.todo.entity.User;
import com.example.todo.security.JwtService;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private JwtService jwtService;
    private User testUser;
    private final String testSecret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", testSecret);
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", 86400000L); // 24 hours

        testUser = new User("Alice Tester", "alice@example.com", "password", Role.USER);
        testUser.setId(42L);
    }

    @Test
    @DisplayName("generateToken generates valid signed JWT with correct subject and claims")
    void generateToken_andExtractSubject_success() {
        String token = jwtService.generateToken(testUser);

        assertThat(token).isNotNull();
        assertThat(token.split("\\.")).hasSize(3); // Header.Payload.Signature

        String username = jwtService.extractUsername(token);
        assertThat(username).isEqualTo("alice@example.com");

        String role = jwtService.extractClaim(token, claims -> claims.get("role", String.class));
        assertThat(role).isEqualTo("USER");

        Number userId = jwtService.extractClaim(token, claims -> claims.get("userId", Number.class));
        assertThat(userId.longValue()).isEqualTo(42L);
    }

    @Test
    @DisplayName("isTokenValid returns true for valid token and matching user details")
    void isTokenValid_matchingUser_returnsTrue() {
        String token = jwtService.generateToken(testUser);

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                "alice@example.com",
                "password",
                Collections.emptyList()
        );

        boolean isValid = jwtService.isTokenValid(token, userDetails);
        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("isTokenValid returns false for mismatched username")
    void isTokenValid_differentUser_returnsFalse() {
        String token = jwtService.generateToken(testUser);

        UserDetails otherUserDetails = new org.springframework.security.core.userdetails.User(
                "stranger@example.com",
                "password",
                Collections.emptyList()
        );

        boolean isValid = jwtService.isTokenValid(token, otherUserDetails);
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Tampered token signature throws JwtException")
    void tamperedToken_throwsJwtException() {
        String token = jwtService.generateToken(testUser);
        String tamperedToken = token.substring(0, token.length() - 5) + "abcde";

        assertThatThrownBy(() -> jwtService.extractUsername(tamperedToken))
                .isInstanceOf(JwtException.class);
    }

    @Test
    @DisplayName("Expired token throws JwtException during claim extraction")
    void expiredToken_throwsJwtException() {
        // Set expiration to negative ms to create an expired token
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", -1000L);
        String expiredToken = jwtService.generateToken(testUser);

        assertThatThrownBy(() -> jwtService.extractUsername(expiredToken))
                .isInstanceOf(JwtException.class);
    }
}
