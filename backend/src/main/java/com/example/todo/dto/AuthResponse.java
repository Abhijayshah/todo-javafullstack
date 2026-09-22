package com.example.todo.dto;

import com.example.todo.entity.Role;

public record AuthResponse(
        String token,
        String type,
        Long id,
        String name,
        String email,
        Role role
) {
    public static AuthResponse of(String token, Long id, String name, String email, Role role) {
        return new AuthResponse(token, "Bearer", id, name, email, role);
    }
}
