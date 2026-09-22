package com.example.todo.service;

import com.example.todo.dto.PageResponse;
import com.example.todo.dto.TodoRequest;
import com.example.todo.dto.TodoResponse;
import com.example.todo.entity.Priority;
import com.example.todo.entity.Role;
import com.example.todo.entity.Todo;
import com.example.todo.entity.User;
import com.example.todo.exception.ResourceNotFoundException;
import com.example.todo.mapper.TodoMapper;
import com.example.todo.repository.TodoRepository;
import com.example.todo.repository.TodoSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class TodoServiceImpl implements TodoService {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "createdAt", "dueDate", "priority", "title"
    );

    private final TodoRepository todoRepository;
    private final TodoMapper todoMapper;
    private final AuthService authService;

    public TodoServiceImpl(
            TodoRepository todoRepository,
            TodoMapper todoMapper,
            AuthService authService
    ) {
        this.todoRepository = todoRepository;
        this.todoMapper = todoMapper;
        this.authService = authService;
    }

    @Override
    public List<TodoResponse> getAllTodos() {
        return getTodos(null, null, null, 0, 1000, "createdAt", "desc").content();
    }

    @Override
    public PageResponse<TodoResponse> getTodos(
            String search,
            String status,
            Priority priority,
            int page,
            int size,
            String sortBy,
            String sortDirection
    ) {
        User currentUser = authService.getAuthenticatedUser();
        // If user is ADMIN, userId is null (views all tasks). If standard USER, filter to own tasks.
        Long userId = currentUser.getRole() == Role.ADMIN ? null : currentUser.getId();

        String validatedSortBy = (sortBy != null && ALLOWED_SORT_FIELDS.contains(sortBy))
                ? sortBy
                : "createdAt";

        Sort.Direction direction = (sortDirection != null && sortDirection.equalsIgnoreCase("asc"))
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        int pageIndex = Math.max(0, page);
        int pageSize = Math.min(Math.max(1, size), 100);

        Pageable pageable = PageRequest.of(pageIndex, pageSize, Sort.by(direction, validatedSortBy));
        Specification<Todo> spec = TodoSpecification.withFilters(userId, search, status, priority);

        Page<Todo> todoPage = todoRepository.findAll(spec, pageable);
        Page<TodoResponse> responsePage = todoPage.map(todoMapper::toResponse);

        return PageResponse.from(responsePage);
    }

    @Override
    public TodoResponse getTodoById(Long id) {
        Todo todo = findTodoOrThrow(id);
        User currentUser = authService.getAuthenticatedUser();
        validateTodoOwnership(todo, currentUser);
        return todoMapper.toResponse(todo);
    }

    @Override
    @Transactional
    public TodoResponse createTodo(TodoRequest request) {
        User currentUser = authService.getAuthenticatedUser();
        Todo todo = todoMapper.toEntity(request, currentUser);
        Todo savedTodo = todoRepository.save(todo);
        return todoMapper.toResponse(savedTodo);
    }

    @Override
    @Transactional
    public TodoResponse updateTodo(Long id, TodoRequest request) {
        Todo existingTodo = findTodoOrThrow(id);
        User currentUser = authService.getAuthenticatedUser();
        validateTodoOwnership(existingTodo, currentUser);

        todoMapper.updateEntity(existingTodo, request);
        Todo updatedTodo = todoRepository.save(existingTodo);
        return todoMapper.toResponse(updatedTodo);
    }

    @Override
    @Transactional
    public TodoResponse toggleComplete(Long id) {
        Todo existingTodo = findTodoOrThrow(id);
        User currentUser = authService.getAuthenticatedUser();
        validateTodoOwnership(existingTodo, currentUser);

        existingTodo.setCompleted(!existingTodo.getCompleted());
        Todo updatedTodo = todoRepository.save(existingTodo);
        return todoMapper.toResponse(updatedTodo);
    }

    @Override
    @Transactional
    public void deleteTodo(Long id) {
        Todo existingTodo = findTodoOrThrow(id);
        User currentUser = authService.getAuthenticatedUser();
        validateTodoOwnership(existingTodo, currentUser);

        todoRepository.delete(existingTodo);
    }

    private Todo findTodoOrThrow(Long id) {
        return todoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Todo", "id", id));
    }

    private void validateTodoOwnership(Todo todo, User currentUser) {
        if (currentUser.getRole() == Role.ADMIN) {
            return; // Admins have cross-user access
        }
        if (!todo.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to access or modify this task.");
        }
    }
}
