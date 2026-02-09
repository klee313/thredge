package com.thredge.backend.domain.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Index
import jakarta.persistence.PrePersist
import jakarta.persistence.PreUpdate
import jakarta.persistence.Table
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(
    name = "todos",
    indexes = [
        Index(
            name = "idx_todos_owner_deadline",
            columnList = "owner_id, deadline",
        ),
    ],
)
class TodoEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    var id: UUID? = null,

    @Column(name = "owner_id", columnDefinition = "uuid", nullable = false)
    var ownerId: UUID? = null,

    @Column(columnDefinition = "text", nullable = false)
    var task: String = "",

    @Column(nullable = false)
    var deadline: LocalDate = LocalDate.now(),

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    var priority: TodoPriority = TodoPriority.BLUE,

    @Column(columnDefinition = "text", nullable = false)
    var blocker: String = "",

    @Column(columnDefinition = "text", nullable = false)
    var solution: String = "",

    @Column(nullable = false)
    var done: Boolean = false,

    @Column(nullable = false)
    var createdAt: Instant = Instant.now(),

    @Column(nullable = false)
    var updatedAt: Instant = Instant.now(),
) {
    @PrePersist
    fun onCreate() {
        val now = Instant.now()
        createdAt = now
        updatedAt = now
    }

    @PreUpdate
    fun onUpdate() {
        updatedAt = Instant.now()
    }
}
