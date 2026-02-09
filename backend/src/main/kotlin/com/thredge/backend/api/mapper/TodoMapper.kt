package com.thredge.backend.api.mapper

import com.thredge.backend.api.dto.TodoDetail
import com.thredge.backend.domain.entity.TodoEntity
import org.springframework.stereotype.Component

@Component
class TodoMapper {
    fun toDetail(todo: TodoEntity): TodoDetail =
            TodoDetail(
                    id = todo.id.toString(),
                    task = todo.task,
                    deadline = todo.deadline,
                    priority = todo.priority,
                    blocker = todo.blocker,
                    solution = todo.solution,
                    done = todo.done,
                    createdAt = todo.createdAt,
                    updatedAt = todo.updatedAt,
            )
}
