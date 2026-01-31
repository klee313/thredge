package com.thredge.backend.support

object UsernameSupport {
    const val REGEX = "^[A-Za-z0-9_]+$"

    fun normalize(raw: String): String = raw.trim()

    fun requireValid(raw: String): String {
        val normalized = normalize(raw)
        if (normalized.isBlank()) {
            throw BadRequestException(ValidationMessages.USERNAME_REQUIRED)
        }
        if (!Regex(REGEX).matches(normalized)) {
            throw BadRequestException(ValidationMessages.USERNAME_INVALID)
        }
        return normalized
    }
}
