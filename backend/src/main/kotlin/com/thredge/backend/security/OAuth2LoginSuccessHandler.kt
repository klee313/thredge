package com.thredge.backend.security

import com.thredge.backend.service.OAuthUserProvisioningService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.security.web.authentication.AuthenticationSuccessHandler
import org.springframework.security.web.context.HttpSessionSecurityContextRepository
import org.springframework.stereotype.Component

@Component
class OAuth2LoginSuccessHandler(
    private val oAuthUserProvisioningService: OAuthUserProvisioningService,
    @Value("\${app.auth.oauth.success-redirect-uri:http://localhost:8082/}")
    private val successRedirectUri: String,
) : AuthenticationSuccessHandler {
    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: org.springframework.security.core.Authentication,
    ) {
        val oauthToken =
            authentication as? OAuth2AuthenticationToken
                ?: throw IllegalStateException("OAuth2 authentication token is required")
        val oauthUser =
            oauthToken.principal as? OAuth2User
                ?: throw IllegalStateException("OAuth2 user principal is required")
        if (oauthToken.authorizedClientRegistrationId != GOOGLE_REGISTRATION_ID) {
            throw IllegalStateException("Unsupported OAuth provider")
        }

        val user = oAuthUserProvisioningService.provisionGoogleUser(oauthUser)
        val authorities = listOf(SimpleGrantedAuthority("ROLE_${user.role.name}"))
        val principal =
            CustomUserDetails(
                username = user.username,
                password = user.passwordHash,
                userId = requireNotNull(user.id),
                authorities = authorities,
            )
        val sessionAuthentication =
            UsernamePasswordAuthenticationToken(principal, null, authorities)
        val context = SecurityContextHolder.createEmptyContext()
        context.authentication = sessionAuthentication
        SecurityContextHolder.setContext(context)
        HttpSessionSecurityContextRepository().saveContext(context, request, response)
        response.sendRedirect(successRedirectUri)
    }

    companion object {
        private const val GOOGLE_REGISTRATION_ID = "google"
    }
}
