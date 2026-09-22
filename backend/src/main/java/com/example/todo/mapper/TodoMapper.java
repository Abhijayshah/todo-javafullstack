package com.example.todo.mapper;

import com.example.todo.dto.TodoRequest;
import com.example.todo.dto.TodoResponse;
import com.example.todo.entity.Todo;
import com.example.todo.entity.User;
import org.springframework.stereotype.Component;

@Component
public class TodoMapper {

    public Todo toEntity(TodoRequest request, User user) {
        if (request == null) {
            return null;
        }
        return new Todo(
                request.title(),
                request.description(),
                request.completed(),
                request.priority(),
                request.dueDate(),
                user
        );
    }

    public TodoResponse toResponse(Todo entity) {
        if (entity == null) {
            return null;
        }
        return new TodoResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getCompleted(),
                entity.getPriority(),
                entity.getDueDate(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public void updateEntity(Todo entity, TodoRequest request) {
        if (entity == null || request == null) {
            return;
        }
        entity.setTitle(request.title());
        entity.setDescription(request.description());
        if (request.completed() != null) {
            entity.setCompleted(request.completed());
        }
        if (request.priority() != null) {
            entity.setPriority(request.priority());
        }
        entity.setDueDate(request.dueDate());
    }
}
