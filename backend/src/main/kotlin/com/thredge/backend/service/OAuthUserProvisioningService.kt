package com.thredge.backend.service

import com.thredge.backend.domain.entity.UserEntity
import com.thredge.backend.domain.repository.UserRepository
import java.util.UUID
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class OAuthUserProvisioningService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
) {
    @Transactional
    fun provisionGoogleUser(oAuth2User: OAuth2User): UserEntity {
        val subject = requireClaim(oAuth2User, "sub")
        val email = oAuth2User.getAttribute<String>("email")?.trim()?.lowercase()
        val displayName = buildDisplayName(oAuth2User.getAttribute<String>("name"), email)

        val existing = userRepository.findByOauthProviderAndOauthSubject(GOOGLE_PROVIDER, subject)
        if (existing != null) {
            var updated = false
            if (displayName != existing.name) {
                existing.name = displayName
                updated = true
            }
            if (email != existing.oauthEmail) {
                existing.oauthEmail = email
                updated = true
            }
            return if (updated) userRepository.save(existing) else existing
        }

        val newUser =
            UserEntity(
                username = buildUniqueUsername(subject),
                name = displayName,
                passwordHash = requireNotNull(passwordEncoder.encode(UUID.randomUUID().toString())),
                oauthProvider = GOOGLE_PROVIDER,
                oauthSubject = subject,
                oauthEmail = email,
            )
        return userRepository.save(newUser)
    }

    private fun requireClaim(oAuth2User: OAuth2User, claimName: String): String {
        return oAuth2User.getAttribute<String>(claimName)
            ?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: throw IllegalArgumentException("Missing OAuth claim: $claimName")
    }

    private fun buildDisplayName(rawName: String?, email: String?): String {
        val byName = rawName?.trim()?.takeIf { it.isNotEmpty() }?.take(MAX_DISPLAY_NAME_LENGTH)
        if (byName != null) {
            return byName
        }
        val byEmail =
            email?.substringBefore("@")?.trim()?.takeIf { it.isNotEmpty() }?.take(MAX_DISPLAY_NAME_LENGTH)
        if (byEmail != null) {
            return byEmail
        }
        return DEFAULT_DISPLAY_NAME
    }

    private fun buildUniqueUsername(subject: String): String {
        val base = buildUsernameBase(subject)
        if (!userRepository.existsByUsername(base)) {
            return base
        }

        var attempt = 2
        while (attempt <= 9999) {
            val suffix = "_$attempt"
            val candidate = base.take(MAX_USERNAME_LENGTH - suffix.length) + suffix
            if (!userRepository.existsByUsername(candidate)) {
                return candidate
            }
            attempt += 1
        }
        throw IllegalStateException("Unable to generate unique username for OAuth user")
    }

    private fun buildUsernameBase(subject: String): String {
        val normalized = subject.lowercase().replace(Regex("[^a-z0-9_]"), "")
        val stable = normalized.takeIf { it.isNotEmpty() } ?: UUID.randomUUID().toString().replace("-", "")
        return (OAUTH_USERNAME_PREFIX + stable).take(MAX_USERNAME_LENGTH)
    }

    companion object {
        private const val GOOGLE_PROVIDER = "google"
        private const val OAUTH_USERNAME_PREFIX = "g_"
        private const val MAX_USERNAME_LENGTH = 80
        private const val MAX_DISPLAY_NAME_LENGTH = 40
        private const val DEFAULT_DISPLAY_NAME = "Google User"
    }
}
