package com.thredge.backend.support

object UserDisplayNameSupport {
    const val MAX_LENGTH = 40

    fun normalize(raw: String): String = raw.trim()

    fun requireValid(raw: String): String {
        val normalized = normalize(raw)
        if (normalized.isBlank()) {
            throw BadRequestException(ValidationMessages.NAME_REQUIRED)
        }
        if (normalized.length > MAX_LENGTH) {
            throw BadRequestException(ValidationMessages.NAME_TOO_LONG)
        }
        return normalized
    }
}
