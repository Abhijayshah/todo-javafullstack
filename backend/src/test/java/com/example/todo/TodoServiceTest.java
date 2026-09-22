package com.example.todo;

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
import com.example.todo.service.AuthService;
import com.example.todo.service.TodoServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TodoServiceTest {

    @Mock
    private TodoRepository todoRepository;

    @Mock
    private TodoMapper todoMapper;

    @Mock
    private AuthService authService;

    @InjectMocks
    private TodoServiceImpl todoService;

    private User ownerUser;
    private User otherUser;
    private User adminUser;
    private Todo sampleTodo;
    private TodoResponse sampleResponse;
    private TodoRequest sampleRequest;

    @BeforeEach
    void setUp() {
        ownerUser = new User("John Owner", "john@example.com", "hashed_pwd", Role.USER);
        ownerUser.setId(1L);

        otherUser = new User("Alice Other", "alice@example.com", "hashed_pwd", Role.USER);
        otherUser.setId(2L);

        adminUser = new User("Admin Boss", "admin@example.com", "hashed_pwd", Role.ADMIN);
        adminUser.setId(99L);

        sampleTodo = new Todo(
                "Write Unit Tests",
                "Comprehensive JUnit & Mockito tests",
                false,
                Priority.HIGH,
                LocalDate.now().plusDays(5),
                ownerUser
        );
        sampleTodo.setId(10L);

        sampleResponse = new TodoResponse(
                10L,
                "Write Unit Tests",
                "Comprehensive JUnit & Mockito tests",
                false,
                Priority.HIGH,
                LocalDate.now().plusDays(5),
                LocalDateTime.now(),
                LocalDateTime.now()
        );

        sampleRequest = new TodoRequest(
                "Write Unit Tests",
                "Comprehensive JUnit & Mockito tests",
                false,
                Priority.HIGH,
                LocalDate.now().plusDays(5)
        );
    }

    @Test
    @DisplayName("createTodo attaches authenticated user, saves, and returns response DTO")
    void createTodo_success() {
        when(authService.getAuthenticatedUser()).thenReturn(ownerUser);
        when(todoMapper.toEntity(sampleRequest, ownerUser)).thenReturn(sampleTodo);
        when(todoRepository.save(sampleTodo)).thenReturn(sampleTodo);
        when(todoMapper.toResponse(sampleTodo)).thenReturn(sampleResponse);

        TodoResponse response = todoService.createTodo(sampleRequest);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.title()).isEqualTo("Write Unit Tests");
        verify(authService).getAuthenticatedUser();
        verify(todoRepository).save(sampleTodo);
    }

    @Test
    @DisplayName("getTodoById returns task when requested by owner")
    void getTodoById_asOwner_success() {
        when(todoRepository.findById(10L)).thenReturn(Optional.of(sampleTodo));
        when(authService.getAuthenticatedUser()).thenReturn(ownerUser);
        when(todoMapper.toResponse(sampleTodo)).thenReturn(sampleResponse);

        TodoResponse response = todoService.getTodoById(10L);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(10L);
        verify(todoRepository).findById(10L);
    }

    @Test
    @DisplayName("getTodoById returns task when requested by ADMIN")
    void getTodoById_asAdmin_success() {
        when(todoRepository.findById(10L)).thenReturn(Optional.of(sampleTodo));
        when(authService.getAuthenticatedUser()).thenReturn(adminUser);
        when(todoMapper.toResponse(sampleTodo)).thenReturn(sampleResponse);

        TodoResponse response = todoService.getTodoById(10L);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(10L);
        verify(todoRepository).findById(10L);
    }

    @Test
    @DisplayName("getTodoById throws AccessDeniedException when requested by another non-admin user")
    void getTodoById_asOtherUser_throwsAccessDeniedException() {
        when(todoRepository.findById(10L)).thenReturn(Optional.of(sampleTodo));
        when(authService.getAuthenticatedUser()).thenReturn(otherUser);

        assertThatThrownBy(() -> todoService.getTodoById(10L))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("You do not have permission");

        verify(todoMapper, never()).toResponse(any());
    }

    @Test
    @DisplayName("getTodoById throws ResourceNotFoundException when task ID does not exist")
    void getTodoById_notFound_throwsResourceNotFoundException() {
        when(todoRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> todoService.getTodoById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Todo not found with id");

        verify(authService, never()).getAuthenticatedUser();
    }

    @Test
    @DisplayName("getTodos restricts query by owner userId when user is Role.USER")
    void getTodos_asUser_appliesUserIsolation() {
        when(authService.getAuthenticatedUser()).thenReturn(ownerUser);
        Page<Todo> pagedResult = new PageImpl<>(List.of(sampleTodo));
        when(todoRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(pagedResult);
        when(todoMapper.toResponse(sampleTodo)).thenReturn(sampleResponse);

        PageResponse<TodoResponse> response = todoService.getTodos(
                "Unit", "PENDING", Priority.HIGH, 0, 10, "createdAt", "desc"
        );

        assertThat(response).isNotNull();
        assertThat(response.content()).hasSize(1);
        assertThat(response.totalElements()).isEqualTo(1);
        verify(authService).getAuthenticatedUser();
        verify(todoRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    @DisplayName("updateTodo updates existing entity and returns updated DTO when owner")
    void updateTodo_asOwner_success() {
        TodoRequest updateRequest = new TodoRequest(
                "Updated Title",
                "Updated Desc",
                true,
                Priority.MEDIUM,
                LocalDate.now().plusDays(10)
        );
        TodoResponse updatedResponse = new TodoResponse(
                10L,
                "Updated Title",
                "Updated Desc",
                true,
                Priority.MEDIUM,
                LocalDate.now().plusDays(10),
                LocalDateTime.now(),
                LocalDateTime.now()
        );

        when(todoRepository.findById(10L)).thenReturn(Optional.of(sampleTodo));
        when(authService.getAuthenticatedUser()).thenReturn(ownerUser);
        doAnswer(invocation -> {
            sampleTodo.setTitle("Updated Title");
            sampleTodo.setDescription("Updated Desc");
            sampleTodo.setCompleted(true);
            sampleTodo.setPriority(Priority.MEDIUM);
            return null;
        }).when(todoMapper).updateEntity(sampleTodo, updateRequest);
        when(todoRepository.save(sampleTodo)).thenReturn(sampleTodo);
        when(todoMapper.toResponse(sampleTodo)).thenReturn(updatedResponse);

        TodoResponse result = todoService.updateTodo(10L, updateRequest);

        assertThat(result).isNotNull();
        assertThat(result.title()).isEqualTo("Updated Title");
        assertThat(result.completed()).isTrue();
        verify(todoRepository).save(sampleTodo);
    }

    @Test
    @DisplayName("updateTodo throws AccessDeniedException when another user attempts modification")
    void updateTodo_asOtherUser_throwsAccessDeniedException() {
        when(todoRepository.findById(10L)).thenReturn(Optional.of(sampleTodo));
        when(authService.getAuthenticatedUser()).thenReturn(otherUser);

        assertThatThrownBy(() -> todoService.updateTodo(10L, sampleRequest))
                .isInstanceOf(AccessDeniedException.class);

        verify(todoRepository, never()).save(any());
    }

    @Test
    @DisplayName("toggleComplete inverts completed flag and saves entity")
    void toggleComplete_asOwner_invertsStatus() {
        assertThat(sampleTodo.getCompleted()).isFalse();

        when(todoRepository.findById(10L)).thenReturn(Optional.of(sampleTodo));
        when(authService.getAuthenticatedUser()).thenReturn(ownerUser);
        when(todoRepository.save(sampleTodo)).thenReturn(sampleTodo);
        when(todoMapper.toResponse(sampleTodo)).thenReturn(
                new TodoResponse(10L, sampleTodo.getTitle(), sampleTodo.getDescription(), true, Priority.HIGH, null, null, null)
        );

        TodoResponse response = todoService.toggleComplete(10L);

        assertThat(sampleTodo.getCompleted()).isTrue();
        assertThat(response.completed()).isTrue();
        verify(todoRepository).save(sampleTodo);
    }

    @Test
    @DisplayName("deleteTodo deletes entity when requested by owner")
    void deleteTodo_asOwner_success() {
        when(todoRepository.findById(10L)).thenReturn(Optional.of(sampleTodo));
        when(authService.getAuthenticatedUser()).thenReturn(ownerUser);

        todoService.deleteTodo(10L);

        verify(todoRepository).delete(sampleTodo);
    }

    @Test
    @DisplayName("deleteTodo throws AccessDeniedException when attempted by non-owner")
    void deleteTodo_asOtherUser_throwsAccessDeniedException() {
        when(todoRepository.findById(10L)).thenReturn(Optional.of(sampleTodo));
        when(authService.getAuthenticatedUser()).thenReturn(otherUser);

        assertThatThrownBy(() -> todoService.deleteTodo(10L))
                .isInstanceOf(AccessDeniedException.class);

        verify(todoRepository, never()).delete(any(Todo.class));
    }
}
