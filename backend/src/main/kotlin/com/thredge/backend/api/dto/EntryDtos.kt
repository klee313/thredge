package com.thredge.backend.api.dto

import com.fasterxml.jackson.annotation.JsonInclude
import com.thredge.backend.support.validation.NotBlankIfPresent
import jakarta.validation.constraints.NotBlank
import java.time.Instant

data class EntryUpdateRequest(
    @field:NotBlankIfPresent(message = "Body is required.")
    val body: String? = null,
)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class EntryDetail(
    val id: String,
    val body: String,
    val parentEntryId: String?,
    val createdAt: Instant,
    // Thread detail responses omit this field to keep payloads small.
    val threadId: String?,
)

data class EntryRequest(
    @field:NotBlank(message = "Body is required.")
    val body: String = "",
    val parentEntryId: String? = null,
)
