package com.thredge.backend.api

import com.thredge.backend.api.dto.AiSettingsRequest
import com.thredge.backend.api.dto.AiSettingsResponse
import com.thredge.backend.api.dto.BlockerRecommendationRequest
import com.thredge.backend.api.dto.BlockerRecommendationResponse
import com.thredge.backend.service.AiService
import com.thredge.backend.support.AuthSupport
import jakarta.validation.Valid
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/ai")
class AiController(
    private val authSupport: AuthSupport,
    private val aiService: AiService,
) {
    @GetMapping("/settings")
    fun getSettings(authentication: Authentication?): AiSettingsResponse {
        val username = authSupport.requireUsername(authentication)
        return aiService.getSettings(username)
    }

    @PatchMapping("/settings")
    fun updateSettings(
        @Valid @RequestBody request: AiSettingsRequest,
        authentication: Authentication?,
    ): AiSettingsResponse {
        val username = authSupport.requireUsername(authentication)
        return aiService.updateSettings(username, request)
    }

    @PostMapping("/blocker-recommendations")
    fun recommend(
        @Valid @RequestBody request: BlockerRecommendationRequest,
        authentication: Authentication?,
    ): BlockerRecommendationResponse {
        val username = authSupport.requireUsername(authentication)
        return aiService.recommendBlockerResolution(username, request)
    }
}
