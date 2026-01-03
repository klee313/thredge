package com.thredge.backend.api.dto

import jakarta.validation.constraints.NotBlank

data class CategorySummary(
    val id: String,
    val name: String,
)

data class CategoryRequest(
    @field:NotBlank(message = "Name is required.")
    val name: String = "",
)
