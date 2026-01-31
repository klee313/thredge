package com.thredge.backend.service

import com.thredge.backend.domain.entity.UserEntity
import com.thredge.backend.domain.repository.UserRepository
import com.thredge.backend.support.ConflictException
import com.thredge.backend.support.UsernameSupport
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class UserService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
) {
    fun createUser(username: String, rawPassword: String): UserEntity {
        val normalizedUsername = UsernameSupport.requireValid(username)
        if (userRepository.existsByUsername(normalizedUsername)) {
            throw ConflictException("Username already exists.")
        }
        val encodedPassword = requireNotNull(passwordEncoder.encode(rawPassword))
        val entity =
                UserEntity(
                        username = normalizedUsername,
                        name = normalizedUsername,
                        passwordHash = encodedPassword
                )
        return userRepository.save(entity)
    }
}
