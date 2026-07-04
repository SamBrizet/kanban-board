import { defineStore } from 'pinia'

const STORAGE_KEY = 'kanban-board-store'

const initialColumns = [
  {
    id: 'backlog',
    title: 'Backlog',
    tone: '#1f4dd9',
    tasks: [
      { id: 'task-1', title: 'Landing QA', description: 'Revisar spacing, foco visible y estados vacios.', priority: 'high', assignee: 'Samanta' },
      { id: 'task-2', title: 'API notes', description: 'Documentar restricciones del endpoint y limites.', priority: 'medium', assignee: 'Marco' },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    tone: '#7c5cff',
    tasks: [
      { id: 'task-3', title: 'Portfolio cards', description: 'Ajustar grid, contraste y CTA secundarios.', priority: 'high', assignee: 'Ana' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    tone: '#15a36e',
    tasks: [
      { id: 'task-4', title: 'Design tokens', description: 'Unificar paleta, radios y sombras base.', priority: 'low', assignee: 'Luis' },
    ],
  },
]

function readStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useKanbanStore = defineStore('kanban', {
  state: () => ({
    columns: initialColumns,
    initialized: false,
    priorityFilter: 'all',
    search: '',
    theme: 'light',
  }),
  getters: {
    filteredColumns(state) {
      return state.columns.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => {
          const matchesPriority = state.priorityFilter === 'all' || task.priority === state.priorityFilter
          const query = state.search.toLowerCase().trim()
          const matchesSearch = !query || `${task.title} ${task.description} ${task.assignee}`.toLowerCase().includes(query)
          return matchesPriority && matchesSearch
        }),
      }))
    },
  },
  actions: {
    initialize() {
      if (this.initialized) return

      const persisted = readStorage()
      if (persisted) {
        this.columns = persisted.columns
        this.theme = persisted.theme
      }
      document.documentElement.dataset.theme = this.theme
      this.initialized = true
    },
    persist() {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ columns: this.columns, theme: this.theme }),
      )
    },
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      document.documentElement.dataset.theme = this.theme
      this.persist()
    },
    addColumn(payload) {
      this.columns.push({ id: crypto.randomUUID(), title: payload.title.trim(), tone: payload.tone, tasks: [] })
      this.persist()
    },
    deleteColumn(columnId) {
      this.columns = this.columns.filter((column) => column.id !== columnId)
      this.persist()
    },
    addTask(columnId, task) {
      const column = this.columns.find((item) => item.id === columnId)
      if (!column) return
      column.tasks.unshift({ ...task, id: crypto.randomUUID(), title: task.title.trim() })
      this.persist()
    },
    updateTask(columnId, task) {
      const column = this.columns.find((item) => item.id === columnId)
      if (!column) return
      const index = column.tasks.findIndex((item) => item.id === task.id)
      if (index === -1) return
      column.tasks[index] = { ...column.tasks[index], ...task, title: task.title.trim() }
      this.persist()
    },
    deleteTask(columnId, taskId) {
      const column = this.columns.find((item) => item.id === columnId)
      if (!column) return
      column.tasks = column.tasks.filter((task) => task.id !== taskId)
      this.persist()
    },
    moveTask({ fromColumnId, taskId, toColumnId, targetTaskId }) {
      const source = this.columns.find((column) => column.id === fromColumnId)
      const target = this.columns.find((column) => column.id === toColumnId)
      if (!source || !target) return

      const taskIndex = source.tasks.findIndex((task) => task.id === taskId)
      if (taskIndex === -1) return
      const [task] = source.tasks.splice(taskIndex, 1)

      if (!targetTaskId) {
        target.tasks.push(task)
      } else {
        const targetIndex = target.tasks.findIndex((item) => item.id === targetTaskId)
        if (targetIndex === -1) {
          target.tasks.push(task)
        } else {
          target.tasks.splice(targetIndex, 0, task)
        }
      }

      this.persist()
    },
  },
})