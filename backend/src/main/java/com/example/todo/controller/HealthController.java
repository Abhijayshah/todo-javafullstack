package com.example.todo.controller;

import com.example.todo.dto.HealthResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Value("${spring.profiles.active:development}")
    private String activeProfile;

    @Autowired(required = false)
    private DataSource dataSource;

    @GetMapping
    public ResponseEntity<HealthResponse> checkHealth() {
        Map<String, Object> details = new HashMap<>();
        details.put("service", "todo-backend");
        details.put("version", "0.0.1-SNAPSHOT");
        details.put("javaVersion", System.getProperty("java.version"));

        String databaseStatus = "NOT_INITIALIZED";
        if (dataSource != null) {
            try (Connection connection = dataSource.getConnection()) {
                databaseStatus = connection.isValid(2) ? "CONNECTED" : "UNREACHABLE";
            } catch (Exception e) {
                databaseStatus = "DISCONNECTED";
                details.put("databaseError", e.getMessage());
            }
        }
        details.put("database", databaseStatus);

        return ResponseEntity.ok(
                HealthResponse.up("Todo API is operational", activeProfile, details)
        );
    }
}
