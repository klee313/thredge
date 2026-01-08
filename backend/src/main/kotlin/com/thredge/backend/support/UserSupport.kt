package com.thredge.backend.support

import com.thredge.backend.security.CustomUserDetails
import java.util.UUID
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component

@Component
class UserSupport {
    fun requireUserId(username: String): UUID {
        val authentication =
                SecurityContextHolder.getContext().authentication
                        ?: throw NotFoundException("User not found.")
        val principal = authentication.principal
        if (principal is CustomUserDetails && principal.username == username) {
            return principal.userId
        }
        throw NotFoundException("User not found.")
    }
}
