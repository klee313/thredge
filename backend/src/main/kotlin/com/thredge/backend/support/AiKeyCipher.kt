package com.thredge.backend.support

import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.Base64
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class AiKeyCipher(
    @Value("\${app.ai.key-secret}")
    private val keySecret: String,
) {
    private val keySpec: SecretKeySpec
    private val random = SecureRandom()

    init {
        require(keySecret.isNotBlank()) { "app.ai.key-secret is required" }
        val digest = MessageDigest.getInstance("SHA-256")
        val keyBytes = digest.digest(keySecret.toByteArray(StandardCharsets.UTF_8))
        keySpec = SecretKeySpec(keyBytes, "AES")
    }

    fun encrypt(raw: String): String {
        val iv = ByteArray(12)
        random.nextBytes(iv)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, GCMParameterSpec(128, iv))
        val encrypted = cipher.doFinal(raw.toByteArray(StandardCharsets.UTF_8))
        val combined = ByteArray(iv.size + encrypted.size)
        System.arraycopy(iv, 0, combined, 0, iv.size)
        System.arraycopy(encrypted, 0, combined, iv.size, encrypted.size)
        return Base64.getEncoder().encodeToString(combined)
    }

    fun decrypt(encoded: String): String {
        val decoded = Base64.getDecoder().decode(encoded)
        require(decoded.size > 12) { "Invalid encrypted payload" }
        val iv = decoded.copyOfRange(0, 12)
        val encrypted = decoded.copyOfRange(12, decoded.size)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, keySpec, GCMParameterSpec(128, iv))
        val plain = cipher.doFinal(encrypted)
        return String(plain, StandardCharsets.UTF_8)
    }
}
