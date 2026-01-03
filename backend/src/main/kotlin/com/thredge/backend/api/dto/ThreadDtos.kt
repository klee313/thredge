package com.thredge.backend.api.dto

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

data class EntryDetail(
    val id: String,
    val body: String,
    val parentEntryId: String?,
    val createdAt: Instant,
)

data class ThreadRequest(
    val title: String? = null,
    val body: String? = null,
    val categoryNames: List<String> = emptyList(),
)

data class EntryRequest(
    val body: String = "",
    val parentEntryId: String? = null,
)
