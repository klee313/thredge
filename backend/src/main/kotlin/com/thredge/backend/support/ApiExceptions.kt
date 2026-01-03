package com.thredge.backend.support

import org.springframework.http.HttpStatus

open class ApiException(
    val status: HttpStatus,
    message: String,
) : RuntimeException(message)

class BadRequestException(message: String) : ApiException(HttpStatus.BAD_REQUEST, message)

class UnauthorizedException(message: String = "Unauthorized") : ApiException(HttpStatus.UNAUTHORIZED, message)

class NotFoundException(message: String) : ApiException(HttpStatus.NOT_FOUND, message)

class ConflictException(message: String) : ApiException(HttpStatus.CONFLICT, message)
