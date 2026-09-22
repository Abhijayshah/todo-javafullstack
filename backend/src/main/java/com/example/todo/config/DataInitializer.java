package com.example.todo.config;

import com.example.todo.entity.Priority;
import com.example.todo.entity.Role;
import com.example.todo.entity.Todo;
import com.example.todo.entity.User;
import com.example.todo.repository.TodoRepository;
import com.example.todo.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final TodoRepository todoRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            TodoRepository todoRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.todoRepository = todoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Seed Demo Users if not present
        User adminUser = userRepository.findByEmail("admin@todo.com").orElseGet(() -> {
            log.info("Seeding default Administrator account (admin@todo.com)...");
            User admin = new User(
                    "System Administrator",
                    "admin@todo.com",
                    passwordEncoder.encode("admin123"),
                    Role.ADMIN
            );
            return userRepository.save(admin);
        });

        User johnUser = userRepository.findByEmail("john@todo.com").orElseGet(() -> {
            log.info("Seeding default Demo User account (john@todo.com)...");
            User john = new User(
                    "John Doe",
                    "john@todo.com",
                    passwordEncoder.encode("password123"),
                    Role.USER
            );
            return userRepository.save(john);
        });

        // 2. Seed Demo Todos for John Doe if empty
        if (todoRepository.count() == 0) {
            log.info("Database is empty. Seeding initial demonstration todos for John Doe...");

            List<Todo> initialTodos = List.of(
                    new Todo(
                            "Bootstrap Java 21 & Spring Boot 3 Architecture",
                            "Setup layered monorepo with Spring Data JPA, Jakarta Validation, and PostgreSQL connection.",
                            true,
                            Priority.HIGH,
                            LocalDate.now().minusDays(2),
                            johnUser
                    ),
                    new Todo(
                            "Implement Todo CRUD REST Endpoints",
                            "Build Controller, Service, Repository, DTO records, and RFC-compliant error handlers.",
                            true,
                            Priority.HIGH,
                            LocalDate.now().minusDays(1),
                            johnUser
                    ),
                    new Todo(
                            "Design Modern React 18 & Tailwind CSS Dashboard",
                            "Build responsive task management dashboard with live metrics and debounced search.",
                            true,
                            Priority.HIGH,
                            LocalDate.now(),
                            johnUser
                    ),
                    new Todo(
                            "Configure Spring Security & JWT Authentication",
                            "Implement BCrypt password hashing, stateless sessions, RBAC, and user data isolation.",
                            false,
                            Priority.HIGH,
                            LocalDate.now().plusDays(2),
                            johnUser
                    ),
                    new Todo(
                            "Prepare Multi-Stage Dockerfile & Orchestration",
                            "Optimize build layer caching with Eclipse Temurin 21 JRE and persistent PostgreSQL volume.",
                            false,
                            Priority.LOW,
                            LocalDate.now().plusDays(7),
                            johnUser
                    )
            );

            todoRepository.saveAll(initialTodos);
            log.info("Successfully seeded {} sample tasks for john@todo.com.", initialTodos.size());
        }
    }
}
