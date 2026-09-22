package com.example.todo.dto;

import java.time.Instant;
import java.util.Map;

public record HealthResponse(
        String status,
        String message,
        Instant timestamp,
        String environment,
        Map<String, Object> details
) {
    public static HealthResponse up(String message, String environment, Map<String, Object> details) {
        return new HealthResponse("UP", message, Instant.now(), environment, details);
    }
}
