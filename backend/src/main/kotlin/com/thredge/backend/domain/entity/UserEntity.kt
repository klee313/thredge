package com.thredge.backend.domain.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.PrePersist
import jakarta.persistence.PreUpdate
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint
import java.time.Instant
import java.util.UUID

@Entity
@Table(
    name = "users",
    uniqueConstraints =
            [
                UniqueConstraint(columnNames = ["username"]),
                UniqueConstraint(columnNames = ["oauth_provider", "oauth_subject"]),
            ],
)
class UserEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    var id: UUID? = null,

    @Column(nullable = false, length = 80)
    var username: String = "",

    @Column(nullable = false, length = 40)
    var name: String = "",

    @Column(name = "password_hash", nullable = false, length = 200)
    var passwordHash: String = "",

    @Column(name = "oauth_provider", length = 30)
    var oauthProvider: String? = null,

    @Column(name = "oauth_subject", length = 255)
    var oauthSubject: String? = null,

    @Column(name = "oauth_email", length = 320)
    var oauthEmail: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var role: UserRole = UserRole.USER,

    @Column(nullable = false)
    var createdAt: Instant = Instant.now(),

    @Column(nullable = false)
    var updatedAt: Instant = Instant.now(),

    @Column(name = "ai_provider", length = 50)
    var aiProvider: String? = null,

    @Column(name = "ai_api_key_encrypted", length = 2000)
    var aiApiKeyEncrypted: String? = null,
) {
    @PrePersist
    fun onCreate() {
        val now = Instant.now()
        createdAt = now
        updatedAt = now
    }

    @PreUpdate
    fun onUpdate() {
        updatedAt = Instant.now()
    }
}
