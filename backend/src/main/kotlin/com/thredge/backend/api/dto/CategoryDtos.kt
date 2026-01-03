package com.thredge.backend.api.dto

import com.thredge.backend.support.ValidationMessages
import jakarta.validation.constraints.NotBlank

data class CategorySummary(
    val id: String,
    val name: String,
)

data class CategoryRequest(
    @field:NotBlank(message = ValidationMessages.NAME_REQUIRED)
    val name: String = "",
)
