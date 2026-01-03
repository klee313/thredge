package com.thredge.backend.support

import java.util.UUID

object IdParser {
    fun parseUuid(raw: String, errorMessage: String): UUID =
        runCatching { UUID.fromString(raw) }.getOrElse {
            throw BadRequestException(errorMessage)
        }
}
