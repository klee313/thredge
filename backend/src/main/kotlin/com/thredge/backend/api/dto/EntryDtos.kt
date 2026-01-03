package com.thredge.backend.api.dto

import java.time.Instant

data class EntryUpdateRequest(
    val body: String? = null,
)

data class EntryResponse(
    val id: String,
    val body: String,
    val parentEntryId: String?,
    val createdAt: Instant,
    val threadId: String?,
)
