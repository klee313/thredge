package com.thredge.backend.domain.repository

import com.thredge.backend.domain.entity.TodoEntity
import java.util.UUID
import org.springframework.data.jpa.repository.JpaRepository

interface TodoRepository : JpaRepository<TodoEntity, UUID> {
    fun findAllByOwnerIdOrderByDeadlineAsc(ownerId: UUID): List<TodoEntity>
}
