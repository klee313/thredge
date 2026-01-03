package com.thredge.backend.api.dto

import jakarta.validation.constraints.NotBlank

data class LoginRequest(
    @field:NotBlank(message = "Username is required.")
    val username: String = "",
    @field:NotBlank(message = "Password is required.")
    val password: String = "",
)

data class AuthResponse(
    val username: String,
)
