package com.thredge.backend.config

import com.thredge.backend.security.OAuth2LoginFailureHandler
import com.thredge.backend.security.OAuth2LoginSuccessHandler
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpMethod
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain

@Configuration
class SecurityConfig {
    @Bean fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()

    @Bean
    fun authenticationManager(configuration: AuthenticationConfiguration): AuthenticationManager =
            configuration.authenticationManager

    @Bean
    fun securityFilterChain(
        http: HttpSecurity,
        oAuth2LoginSuccessHandler: OAuth2LoginSuccessHandler,
        oAuth2LoginFailureHandler: OAuth2LoginFailureHandler,
        @Value("\${app.auth.oauth.enabled:false}") oauthEnabled: Boolean,
    ): SecurityFilterChain {
        http
                .cors {}
                .csrf { it.disable() }
                .authorizeHttpRequests { auth ->
                    auth.requestMatchers(HttpMethod.OPTIONS, "/**")
                            .permitAll()
                            .requestMatchers(
                                    "/v3/api-docs/**",
                                    "/swagger-ui/**",
                                    "/swagger-ui.html"
                            )
                            .permitAll()
                            .requestMatchers("/actuator/health", "/actuator/info")
                            .permitAll()
                            .requestMatchers("/api/health")
                            .permitAll()
                            .requestMatchers("/oauth2/**", "/login/oauth2/**")
                            .permitAll()
                            .requestMatchers("/api/auth/login", "/api/auth/signup", "/api/auth/logout")
                            .permitAll()
                            .requestMatchers("/api/admin/**")
                            .hasRole("ADMIN")
                            .anyRequest()
                            .authenticated()
                }
                .sessionManagement { session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                }
        if (oauthEnabled) {
            http.oauth2Login { oauth ->
                oauth.successHandler(oAuth2LoginSuccessHandler)
                    .failureHandler(oAuth2LoginFailureHandler)
            }
        }
        return http.build()
    }
}
