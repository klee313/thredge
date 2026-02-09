package com.thredge.backend.api.dto

import com.fasterxml.jackson.annotation.JsonInclude
import com.thredge.backend.domain.entity.TodoPriority
import com.thredge.backend.support.ValidationMessages
import com.thredge.backend.support.validation.NotBlankIfPresent
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.time.Instant
import java.time.LocalDate

data class TodoCreateRequest(
    @field:NotBlank(message = ValidationMessages.TODO_TASK_REQUIRED)
    val task: String,
    @field:NotNull(message = ValidationMessages.TODO_DEADLINE_REQUIRED)
    val deadline: LocalDate,
    @field:NotNull(message = ValidationMessages.TODO_PRIORITY_REQUIRED)
    val priority: TodoPriority,
    val blocker: String? = null,
    val solution: String? = null,
)

data class TodoUpdateRequest(
    @field:NotBlankIfPresent(message = ValidationMessages.TODO_TASK_REQUIRED)
    val task: String? = null,
    val deadline: LocalDate? = null,
    val priority: TodoPriority? = null,
    val blocker: String? = null,
    val solution: String? = null,
    val done: Boolean? = null,
)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class TodoDetail(
    val id: String,
    val task: String,
    val deadline: LocalDate,
    val priority: TodoPriority,
    val blocker: String,
    val solution: String,
    val done: Boolean,
    val createdAt: Instant,
    val updatedAt: Instant,
)
