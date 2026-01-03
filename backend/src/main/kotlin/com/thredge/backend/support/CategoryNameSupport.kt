package com.thredge.backend.support

object CategoryNameSupport {
    const val MAX_LENGTH = 80

    fun normalize(raw: String): String = raw.trim()

    fun normalizeAll(rawNames: Collection<String>): List<String> =
        rawNames.map(::normalize).filter { it.isNotEmpty() }

    fun key(name: String): String = normalize(name).lowercase()

    fun validateLength(name: String) {
        if (name.length > MAX_LENGTH) {
            throw BadRequestException(ValidationMessages.NAME_TOO_LONG)
        }
    }
}
