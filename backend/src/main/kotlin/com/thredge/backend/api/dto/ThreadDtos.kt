package com.thredge.backend.api.dto

import com.thredge.backend.support.validation.NotBlankIfPresent
import jakarta.validation.constraints.NotBlank
import java.time.Instant

data class ThreadSummary(
    val id: String,
    val title: String,
    val lastActivityAt: Instant,
    val categories: List<CategorySummary>,
    val pinned: Boolean,
)

data class ThreadDetail(
    val id: String,
    val title: String,
    val body: String?,
    val createdAt: Instant,
    val lastActivityAt: Instant,
    val categories: List<CategorySummary>,
    val pinned: Boolean,
    val entries: List<EntryDetail>,
)

data class ThreadCreateRequest(
    @field:NotBlank(message = "Body is required.")
    val body: String = "",
    val categoryNames: List<String> = emptyList(),
)

data class ThreadUpdateRequest(
    @field:NotBlankIfPresent(message = "Title is required.")
    val title: String? = null,
    @field:NotBlankIfPresent(message = "Body is required.")
    val body: String? = null,
    val categoryNames: List<String>? = null,
)
