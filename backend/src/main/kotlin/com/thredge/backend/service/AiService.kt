package com.thredge.backend.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.thredge.backend.api.dto.AiSettingsRequest
import com.thredge.backend.api.dto.AiSettingsResponse
import com.thredge.backend.api.dto.BlockerRecommendationRequest
import com.thredge.backend.api.dto.BlockerRecommendationResponse
import com.thredge.backend.domain.repository.UserRepository
import com.thredge.backend.support.BadRequestException
import com.thredge.backend.support.AiKeyCipher
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class AiService(
    private val userRepository: UserRepository,
    private val aiKeyCipher: AiKeyCipher,
    private val objectMapper: ObjectMapper,
    @Value("\${app.ai.openai.model:gpt-4o-mini}")
    private val openAiModel: String,
) {
    private val httpClient = HttpClient.newHttpClient()
    private val supportedProviders = setOf("openai")

    fun getSettings(username: String): AiSettingsResponse {
        val user = userRepository.findByUsername(username) ?: throw BadRequestException("User not found")
        return AiSettingsResponse(
            provider = user.aiProvider,
            hasApiKey = !user.aiApiKeyEncrypted.isNullOrBlank(),
        )
    }

    fun updateSettings(username: String, request: AiSettingsRequest): AiSettingsResponse {
        val user = userRepository.findByUsername(username) ?: throw BadRequestException("User not found")
        val provider = request.provider?.trim()?.lowercase()
        if (provider != null && provider !in supportedProviders) {
            throw BadRequestException("Unsupported AI provider")
        }
        if (!request.apiKey.isNullOrBlank()) {
            user.aiApiKeyEncrypted = aiKeyCipher.encrypt(request.apiKey.trim())
        }
        if (provider != null) {
            user.aiProvider = provider
        }
        userRepository.save(user)
        return AiSettingsResponse(
            provider = user.aiProvider,
            hasApiKey = !user.aiApiKeyEncrypted.isNullOrBlank(),
        )
    }

    fun recommendBlockerResolution(
        username: String,
        request: BlockerRecommendationRequest,
    ): BlockerRecommendationResponse {
        val user = userRepository.findByUsername(username) ?: throw BadRequestException("User not found")
        val provider = user.aiProvider
        if (provider.isNullOrBlank()) {
            throw BadRequestException("AI provider not set")
        }
        if (provider !in supportedProviders) {
            throw BadRequestException("Unsupported AI provider")
        }
        val encryptedKey = user.aiApiKeyEncrypted ?: throw BadRequestException("AI API key missing")
        val apiKey = aiKeyCipher.decrypt(encryptedKey)

        return when (provider) {
            "openai" -> BlockerRecommendationResponse(
                content = requestOpenAiRecommendations(apiKey, request),
            )
            else -> throw BadRequestException("Unsupported AI provider")
        }
    }

    private fun requestOpenAiRecommendations(
        apiKey: String,
        request: BlockerRecommendationRequest,
    ): String {
        val systemPrompt =
            "너는 실용적인 문제 해결 코치다. 블로커를 해소하는 실행 가능한 방법을 2~3개 추천한다."
        val userPrompt = buildString {
            append("아래 할 일의 블로커를 해결하기 위한 방법을 추천해줘. 각 방법은 2문장 이내로.\n")
            append("할일: ${request.task}\n")
            append("데드라인: ${request.deadline}\n")
            append("중요도: ${request.priority}\n")
            append("블로커: ${request.blocker}\n")
            append("현재 해결 방식: ${request.currentSolution}\n")
        }
        val payload = mapOf(
            "model" to openAiModel,
            "temperature" to 0.7,
            "messages" to listOf(
                mapOf("role" to "system", "content" to systemPrompt),
                mapOf("role" to "user", "content" to userPrompt),
            ),
        )
        val body = objectMapper.writeValueAsString(payload)
        val httpRequest = HttpRequest.newBuilder()
            .uri(URI.create("https://api.openai.com/v1/chat/completions"))
            .header("Authorization", "Bearer $apiKey")
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build()
        val response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString())
        if (response.statusCode() !in 200..299) {
            throw BadRequestException("AI request failed: ${response.statusCode()}")
        }
        val json = objectMapper.readTree(response.body())
        val content = json.path("choices").get(0).path("message").path("content").asText("")
        if (content.isBlank()) {
            throw BadRequestException("AI response empty")
        }
        return content.trim()
    }
}
