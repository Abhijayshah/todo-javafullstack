package com.example.todo.service;

import com.example.todo.dto.PageResponse;
import com.example.todo.dto.TodoRequest;
import com.example.todo.dto.TodoResponse;
import com.example.todo.entity.Priority;

import java.util.List;

public interface TodoService {

    List<TodoResponse> getAllTodos();

    PageResponse<TodoResponse> getTodos(
            String search,
            String status,
            Priority priority,
            int page,
            int size,
            String sortBy,
            String sortDirection
    );

    TodoResponse getTodoById(Long id);

    TodoResponse createTodo(TodoRequest request);

    TodoResponse updateTodo(Long id, TodoRequest request);

    TodoResponse toggleComplete(Long id);

    void deleteTodo(Long id);
}
