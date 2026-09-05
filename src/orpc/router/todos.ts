import { os } from '#/orpc/server'
import { TodoSchema } from '#/orpc/schema'

interface Todo {
  id: number
  name: string
}

const todos: Todo[] = []

export const listTodos = os.handler(async () => {
  return todos
})

export const addTodo = os
  .input(TodoSchema.omit({ id: true }))
  .handler(async ({ input }) => {
    const todo: Todo = { id: todos.length + 1, name: input.name }
    todos.push(todo)
    return todo
  })
