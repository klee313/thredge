package com.thredge.backend.config

import io.swagger.v3.oas.annotations.OpenAPIDefinition
import io.swagger.v3.oas.annotations.info.Info
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.springframework.context.annotation.Configuration

@OpenAPIDefinition(
    info = Info(
        title = "thredge API",
        version = "v0",
        description = "thredge backend API (Kotlin/Spring).",
    ),
)
@ApiResponses(
    value = [
        ApiResponse(
            responseCode = "400",
            description = "Bad Request",
            content = [Content(schema = Schema(implementation = ErrorResponse::class))],
        ),
        ApiResponse(
            responseCode = "401",
            description = "Unauthorized",
            content = [Content(schema = Schema(implementation = ErrorResponse::class))],
        ),
        ApiResponse(
            responseCode = "404",
            description = "Not Found",
            content = [Content(schema = Schema(implementation = ErrorResponse::class))],
        ),
        ApiResponse(
            responseCode = "409",
            description = "Conflict",
            content = [Content(schema = Schema(implementation = ErrorResponse::class))],
        ),
    ],
)
@Configuration
class OpenApiConfig {
    data class ErrorResponse(
        val message: String,
    )
}
