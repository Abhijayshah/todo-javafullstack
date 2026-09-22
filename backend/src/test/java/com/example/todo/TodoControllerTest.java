package com.example.todo;

import com.example.todo.dto.TodoRequest;
import com.example.todo.entity.Priority;
import com.example.todo.entity.Role;
import com.example.todo.entity.Todo;
import com.example.todo.entity.User;
import com.example.todo.repository.TodoRepository;
import com.example.todo.repository.UserRepository;
import com.example.todo.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class TodoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TodoRepository todoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    private User userJohn;
    private User userAlice;
    private String johnToken;
    private String aliceToken;
    private Todo johnTodo;

    @BeforeEach
    void setUp() {
        todoRepository.deleteAll();
        userRepository.deleteAll();

        userJohn = userRepository.save(new User("John Doe", "john@example.com", passwordEncoder.encode("password123"), Role.USER));
        userAlice = userRepository.save(new User("Alice Smith", "alice@example.com", passwordEncoder.encode("password123"), Role.USER));

        johnToken = jwtService.generateToken(userJohn);
        aliceToken = jwtService.generateToken(userAlice);

        johnTodo = todoRepository.save(new Todo(
                "John's Secret Task",
                "Testing Spring Security User Isolation",
                false,
                Priority.HIGH,
                LocalDate.now().plusDays(2),
                userJohn
        ));
    }

    @Test
    void unauthenticatedRequest_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/todos")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getAllTodos_asOwner_shouldReturnOnlyOwnerTodos() throws Exception {
        // Create a task for Alice as well
        todoRepository.save(new Todo("Alice's Task", "Desc", false, Priority.LOW, null, userAlice));

        // John requests all todos -> should only receive his 1 task!
        mockMvc.perform(get("/api/todos")
                        .header("Authorization", "Bearer " + johnToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].title").value("John's Secret Task"));
    }

    @Test
    void getTodoById_asOwner_shouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/todos/{id}", johnTodo.getId())
                        .header("Authorization", "Bearer " + johnToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(johnTodo.getId()))
                .andExpect(jsonPath("$.title").value("John's Secret Task"));
    }

    @Test
    void getTodoById_asAnotherUser_shouldReturn403Forbidden() throws Exception {
        // Alice attempts to access John's task by changing the ID in the URL
        mockMvc.perform(get("/api/todos/{id}", johnTodo.getId())
                        .header("Authorization", "Bearer " + aliceToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"))
                .andExpect(jsonPath("$.message").value(containsString("do not have permission")));
    }

    @Test
    void createTodo_shouldAttachCurrentUser() throws Exception {
        TodoRequest request = new TodoRequest(
                "Alice's New Feature",
                "Description for Alice",
                false,
                Priority.MEDIUM,
                LocalDate.now().plusDays(3)
        );

        mockMvc.perform(post("/api/todos")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.title").value("Alice's New Feature"));
    }

    @Test
    void updateTodo_asAnotherUser_shouldReturn403Forbidden() throws Exception {
        TodoRequest updateRequest = new TodoRequest(
                "Hacked Title",
                "Malicious Update",
                true,
                Priority.LOW,
                null
        );

        mockMvc.perform(put("/api/todos/{id}", johnTodo.getId())
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    void toggleComplete_asAnotherUser_shouldReturn403Forbidden() throws Exception {
        mockMvc.perform(patch("/api/todos/{id}/complete", johnTodo.getId())
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void deleteTodo_asAnotherUser_shouldReturn403Forbidden() throws Exception {
        mockMvc.perform(delete("/api/todos/{id}", johnTodo.getId())
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void deleteTodo_asOwner_shouldReturn204NoContent() throws Exception {
        mockMvc.perform(delete("/api/todos/{id}", johnTodo.getId())
                        .header("Authorization", "Bearer " + johnToken))
                .andExpect(status().isNoContent());

        // Verify task is deleted
        mockMvc.perform(get("/api/todos/{id}", johnTodo.getId())
                        .header("Authorization", "Bearer " + johnToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void getTodoById_whenNotFound_shouldReturn404() throws Exception {
        mockMvc.perform(get("/api/todos/{id}", 99999L)
                        .header("Authorization", "Bearer " + johnToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void createTodo_withBlankTitle_shouldReturn400BadRequest() throws Exception {
        TodoRequest invalidRequest = new TodoRequest(
                "   ",
                "Valid description",
                false,
                Priority.HIGH,
                LocalDate.now().plusDays(1)
        );

        mockMvc.perform(post("/api/todos")
                        .header("Authorization", "Bearer " + johnToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors", hasItem(containsString("Title is required"))));
    }

    @Test
    void createTodo_withTitleExceedingMaxLength_shouldReturn400BadRequest() throws Exception {
        String longTitle = "A".repeat(256);
        TodoRequest invalidRequest = new TodoRequest(
                longTitle,
                "Valid description",
                false,
                Priority.MEDIUM,
                LocalDate.now().plusDays(1)
        );

        mockMvc.perform(post("/api/todos")
                        .header("Authorization", "Bearer " + johnToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void createTodo_withMissingPriority_shouldReturn400BadRequest() throws Exception {
        String payloadWithoutPriority = "{\"title\":\"Task without priority\"}";

        mockMvc.perform(post("/api/todos")
                        .header("Authorization", "Bearer " + johnToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadWithoutPriority))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void createTodo_withMalformedJson_shouldReturn400BadRequest() throws Exception {
        String malformedJson = "{\"title\": \"Broken JSON...";

        mockMvc.perform(post("/api/todos")
                        .header("Authorization", "Bearer " + johnToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(malformedJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void requestWithInvalidJwt_shouldReturn401Unauthorized() throws Exception {
        mockMvc.perform(get("/api/todos")
                        .header("Authorization", "Bearer invalid.jwt.token")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void getTodos_asAdmin_shouldSeeAllUsersTodos() throws Exception {
        User admin = userRepository.save(new User("Admin User", "admin@example.com", passwordEncoder.encode("admin123"), Role.ADMIN));
        String adminToken = jwtService.generateToken(admin);

        // Save a task for Alice as well
        todoRepository.save(new Todo("Alice's Secret", "Desc", false, Priority.LOW, null, userAlice));

        mockMvc.perform(get("/api/todos")
                        .header("Authorization", "Bearer " + adminToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }
}
