package com.thredge.backend.service

import com.thredge.backend.api.dto.TodoCreateRequest
import com.thredge.backend.api.dto.TodoDetail
import com.thredge.backend.api.dto.TodoUpdateRequest
import com.thredge.backend.api.mapper.TodoMapper
import com.thredge.backend.domain.entity.TodoEntity
import com.thredge.backend.domain.repository.TodoRepository
import com.thredge.backend.support.NotFoundException
import com.thredge.backend.support.UserSupport
import java.util.UUID
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class TodoService(
    private val todoRepository: TodoRepository,
    private val todoMapper: TodoMapper,
    private val userSupport: UserSupport,
) {
    @Transactional(readOnly = true)
    fun list(ownerUsername: String): List<TodoDetail> {
        val ownerId = userSupport.requireUserId(ownerUsername)
        return todoRepository
                .findAllByOwnerIdOrderByDeadlineAsc(ownerId)
                .map(todoMapper::toDetail)
    }

    @Transactional
    fun create(ownerUsername: String, request: TodoCreateRequest): TodoDetail {
        val ownerId = userSupport.requireUserId(ownerUsername)
        val todo =
                TodoEntity(
                        ownerId = ownerId,
                        task = request.task.trim(),
                        deadline = request.deadline,
                        priority = request.priority,
                        blocker = request.blocker?.trim() ?: "",
                        solution = request.solution?.trim() ?: "",
                        done = false,
                )
        return todoMapper.toDetail(todoRepository.save(todo))
    }

    @Transactional
    fun update(ownerUsername: String, id: String, request: TodoUpdateRequest): TodoDetail {
        val ownerId = userSupport.requireUserId(ownerUsername)
        val uuid = parseId(id)
        val todo = todoRepository.findById(uuid).orElseThrow { NotFoundException("Todo not found.") }
        if (todo.ownerId != ownerId) {
            throw NotFoundException("Todo not found.")
        }
        request.task?.let { todo.task = it.trim() }
        request.deadline?.let { todo.deadline = it }
        request.priority?.let { todo.priority = it }
        request.blocker?.let { todo.blocker = it.trim() }
        request.solution?.let { todo.solution = it.trim() }
        request.done?.let { todo.done = it }
        return todoMapper.toDetail(todoRepository.save(todo))
    }

    private fun parseId(id: String): UUID =
            com.thredge.backend.support.IdParser.parseUuid(id, "Invalid todo id.")
}
