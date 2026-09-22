package com.example.todo.dto;

import com.example.todo.entity.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record TodoRequest(
        @NotBlank(message = "Title is required")
        @Size(min = 1, max = 255, message = "Title must be between 1 and 255 characters")
        String title,

        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        String description,

        Boolean completed,

        @NotNull(message = "Priority is required (LOW, MEDIUM, HIGH)")
        Priority priority,

        LocalDate dueDate
) {
}
