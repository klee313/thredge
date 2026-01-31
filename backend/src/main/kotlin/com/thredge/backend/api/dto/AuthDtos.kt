package com.thredge.backend.api.dto

import com.thredge.backend.support.UserDisplayNameSupport
import com.thredge.backend.support.UsernameSupport
import com.thredge.backend.support.ValidationMessages
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

data class LoginRequest(
    @field:NotBlank(message = ValidationMessages.USERNAME_REQUIRED)
    @field:Pattern(regexp = UsernameSupport.REGEX, message = ValidationMessages.USERNAME_INVALID)
    val username: String = "",
    @field:NotBlank(message = ValidationMessages.PASSWORD_REQUIRED)
    val password: String = "",
)

data class SignupRequest(
    @field:NotBlank(message = ValidationMessages.USERNAME_REQUIRED)
    @field:Pattern(regexp = UsernameSupport.REGEX, message = ValidationMessages.USERNAME_INVALID)
    val username: String = "",
    @field:NotBlank(message = ValidationMessages.PASSWORD_REQUIRED)
    val password: String = "",
)

data class AuthResponse(
    val username: String,
    val name: String,
    val role: String,
)

data class DisplayNameRequest(
    @field:NotBlank(message = ValidationMessages.NAME_REQUIRED)
    @field:Size(max = UserDisplayNameSupport.MAX_LENGTH, message = ValidationMessages.NAME_TOO_LONG)
    val name: String = "",
)
