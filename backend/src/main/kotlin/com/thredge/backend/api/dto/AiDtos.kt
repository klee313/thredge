package com.thredge.backend.api.dto

data class AiSettingsRequest(
    val provider: String?,
    val apiKey: String?,
)

data class AiSettingsResponse(
    val provider: String?,
    val hasApiKey: Boolean,
)

data class BlockerRecommendationRequest(
    val task: String,
    val deadline: String,
    val priority: String,
    val blocker: String,
    val currentSolution: String,
)

data class BlockerRecommendationResponse(
    val content: String,
)
