package com.thredge.backend.support

import com.thredge.backend.security.CustomUserDetails
import java.util.UUID
import org.springframework.security.authentication.AnonymousAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component

@Component
class AuthSupport {
    fun requireUsername(authentication: Authentication?): String {
        if (authentication == null ||
                        !authentication.isAuthenticated ||
                        authentication is AnonymousAuthenticationToken
        ) {
            throw UnauthorizedException()
        }
        return authentication.name
    }

    fun requireUserId(authentication: Authentication?): UUID {
        if (authentication == null ||
                        !authentication.isAuthenticated ||
                        authentication is AnonymousAuthenticationToken
        ) {
            throw UnauthorizedException()
        }
        val principal = authentication.principal
        if (principal is CustomUserDetails) {
            return principal.userId
        }
        throw UnauthorizedException("Invalid authentication principal")
    }

    fun requireAdmin(authentication: Authentication?) {
        requireUsername(authentication)
        val isAdmin = authentication?.authorities?.any { it.authority == "ROLE_ADMIN" } ?: false
        if (!isAdmin) {
            throw UnauthorizedException("Admin access required")
        }
    }
}
