package com.thredge.backend.api.dto

import com.thredge.backend.support.CategoryNameSupport
import com.thredge.backend.support.ValidationMessages
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class CategorySummary(
    val id: String,
    val name: String,
)

data class CategoryCountSummary(
    val id: String,
    val count: Long,
)

data class CategoryCountsResponse(
    val counts: List<CategoryCountSummary>,
    val uncategorizedCount: Long,
)

data class CategoryRequest(
    @field:NotBlank(message = ValidationMessages.NAME_REQUIRED)
    @field:Size(max = CategoryNameSupport.MAX_LENGTH, message = ValidationMessages.NAME_TOO_LONG)
    val name: String = "",
)
