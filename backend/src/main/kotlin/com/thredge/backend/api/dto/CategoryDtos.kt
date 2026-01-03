package com.thredge.backend.api.dto

data class CategorySummary(
    val id: String,
    val name: String,
)

data class CategoryRequest(
    val name: String = "",
)
