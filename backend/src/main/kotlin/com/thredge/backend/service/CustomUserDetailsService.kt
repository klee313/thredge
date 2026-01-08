package com.thredge.backend.service

import com.thredge.backend.domain.repository.UserRepository
import com.thredge.backend.security.CustomUserDetails
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CustomUserDetailsService(private val userRepository: UserRepository) : UserDetailsService {

        @Transactional(readOnly = true)
        override fun loadUserByUsername(username: String): UserDetails {
                val userEntity =
                        userRepository.findByUsername(username)
                                ?: throw UsernameNotFoundException(
                                        "User not found with username: $username"
                                )

                return CustomUserDetails(
                        username = userEntity.username,
                        password = userEntity.passwordHash,
                        userId = userEntity.id!!,
                        authorities =
                                listOf(SimpleGrantedAuthority("ROLE_${userEntity.role.name}")),
                )
        }
}
