package com.thredge.backend.api

import com.thredge.backend.api.dto.TodoCreateRequest
import com.thredge.backend.api.dto.TodoDetail
import com.thredge.backend.api.dto.TodoUpdateRequest
import com.thredge.backend.service.TodoService
import com.thredge.backend.support.AuthSupport
import jakarta.validation.Valid
import org.springframework.security.core.Authentication
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/todos")
@Validated
class TodoController(
    private val todoService: TodoService,
    private val authSupport: AuthSupport,
) {
    @GetMapping
    fun list(authentication: Authentication?): List<TodoDetail> {
        val ownerUsername = authSupport.requireUsername(authentication)
        return todoService.list(ownerUsername)
    }

    @PostMapping
    fun create(
        @Valid @RequestBody request: TodoCreateRequest,
        authentication: Authentication?,
    ): TodoDetail {
        val ownerUsername = authSupport.requireUsername(authentication)
        return todoService.create(ownerUsername, request)
    }

    @PatchMapping("/{id}")
    fun update(
        @PathVariable id: String,
        @Valid @RequestBody request: TodoUpdateRequest,
        authentication: Authentication?,
    ): TodoDetail {
        val ownerUsername = authSupport.requireUsername(authentication)
        return todoService.update(ownerUsername, id, request)
    }
}
