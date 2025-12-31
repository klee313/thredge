package com.thredge.backend.config

import io.swagger.v3.oas.annotations.OpenAPIDefinition
import io.swagger.v3.oas.annotations.info.Info
import org.springframework.context.annotation.Configuration

@OpenAPIDefinition(
    info = Info(
        title = "thredge API",
        version = "v0",
        description = "thredge backend API (Kotlin/Spring).",
    ),
)
@Configuration
class OpenApiConfig

