package com.thredge.backend.api.dto

data class LoginRequest(
    val username: String = "",
    val password: String = "",
)

data class AuthResponse(
    val username: String,
)
