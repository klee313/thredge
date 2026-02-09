package com.thredge.backend.security

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.AuthenticationException
import org.springframework.security.web.authentication.AuthenticationFailureHandler
import org.springframework.stereotype.Component

@Component
class OAuth2LoginFailureHandler(
    @Value("\${app.auth.oauth.failure-redirect-uri:http://localhost:8082/login?oauth=failed}")
    private val failureRedirectUri: String,
) : AuthenticationFailureHandler {
    override fun onAuthenticationFailure(
        request: HttpServletRequest,
        response: HttpServletResponse,
        exception: AuthenticationException,
    ) {
        response.sendRedirect(failureRedirectUri)
    }
}
