package com.example.todo.repository;

import com.example.todo.entity.Priority;
import com.example.todo.entity.Todo;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class TodoSpecification {

    public static Specification<Todo> withFilters(Long userId, String search, String status, Priority priority) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. User isolation filter (if userId is provided)
            if (userId != null) {
                predicates.add(cb.equal(root.get("user").get("id"), userId));
            }

            // 2. Search by title and description (case-insensitive)
            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), searchPattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), searchPattern);
                predicates.add(cb.or(titleMatch, descMatch));
            }

            // 3. Filter by status (COMPLETED / PENDING)
            if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
                if (status.equalsIgnoreCase("COMPLETED")) {
                    predicates.add(cb.isTrue(root.get("completed")));
                } else if (status.equalsIgnoreCase("PENDING")) {
                    predicates.add(cb.isFalse(root.get("completed")));
                }
            }

            // 4. Filter by priority
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
