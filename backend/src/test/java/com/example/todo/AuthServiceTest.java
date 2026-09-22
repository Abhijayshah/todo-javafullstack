package com.example.todo;

import com.example.todo.dto.AuthResponse;
import com.example.todo.dto.LoginRequest;
import com.example.todo.dto.RegisterRequest;
import com.example.todo.dto.UserResponse;
import com.example.todo.entity.Role;
import com.example.todo.entity.User;
import com.example.todo.exception.ResourceNotFoundException;
import com.example.todo.exception.UserAlreadyExistsException;
import com.example.todo.repository.UserRepository;
import com.example.todo.security.JwtService;
import com.example.todo.service.AuthServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthServiceImpl authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("Jane Developer", "jane@example.com", "encoded_password", Role.USER);
        sampleUser.setId(5L);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("register creates user with encoded password and returns AuthResponse with token")
    void register_success() {
        RegisterRequest request = new RegisterRequest("Jane Developer", "Jane@Example.com", "mypassword");

        when(userRepository.existsByEmail("jane@example.com")).thenReturn(false);
        when(passwordEncoder.encode("mypassword")).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(jwtService.generateToken(sampleUser)).thenReturn("sample.jwt.token");

        AuthResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.token()).isEqualTo("sample.jwt.token");
        assertThat(response.email()).isEqualTo("jane@example.com");
        assertThat(response.role()).isEqualTo(Role.USER);
        verify(passwordEncoder).encode("mypassword");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("register throws UserAlreadyExistsException when email already exists")
    void register_duplicateEmail_throwsUserAlreadyExistsException() {
        RegisterRequest request = new RegisterRequest("Jane Developer", "jane@example.com", "mypassword");
        when(userRepository.existsByEmail("jane@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessageContaining("already exists");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("login authenticates credentials and returns AuthResponse")
    void login_success() {
        LoginRequest request = new LoginRequest("jane@example.com", "mypassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken("jane@example.com", "mypassword"));
        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(sampleUser));
        when(jwtService.generateToken(sampleUser)).thenReturn("sample.jwt.token");

        AuthResponse response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.token()).isEqualTo("sample.jwt.token");
        assertThat(response.id()).isEqualTo(5L);
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    @DisplayName("login throws BadCredentialsException on authentication failure")
    void login_badCredentials_throwsBadCredentialsException() {
        LoginRequest request = new LoginRequest("jane@example.com", "wrongpassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Invalid email or password");

        verify(jwtService, never()).generateToken(any());
    }

    @Test
    @DisplayName("getCurrentUser returns user profile from security context")
    void getCurrentUser_success() {
        Authentication authentication = mock(Authentication.class);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn("jane@example.com");
        when(authentication.getName()).thenReturn("jane@example.com");

        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(sampleUser));

        UserResponse userResponse = authService.getCurrentUser();

        assertThat(userResponse).isNotNull();
        assertThat(userResponse.email()).isEqualTo("jane@example.com");
        assertThat(userResponse.name()).isEqualTo("Jane Developer");
    }

    @Test
    @DisplayName("getAuthenticatedUser throws BadCredentialsException when no authentication in context")
    void getAuthenticatedUser_noAuth_throwsBadCredentialsException() {
        SecurityContextHolder.clearContext();

        assertThatThrownBy(() -> authService.getAuthenticatedUser())
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("No authenticated user found");
    }
}
