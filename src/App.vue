<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import BoardHeader from './components/BoardHeader.vue'
import ColumnCard from './components/ColumnCard.vue'
import { useKanbanStore } from './stores/kanbanStore.js'

const store = useKanbanStore()

const columnForm = reactive({ title: '', tone: '#141c2d' })
const taskDraft = reactive({
  id: null,
  columnId: '',
  title: '',
  description: '',
  priority: 'medium',
  assignee: '',
})

const dragging = ref(null)

onMounted(() => {
  store.initialize()
})

const visibleColumns = computed(() => store.filteredColumns)
const isEditingTask = computed(() => Boolean(taskDraft.id))

function createColumn() {
  if (!columnForm.title.trim()) return
  store.addColumn({ ...columnForm })
  columnForm.title = ''
}

function openTaskForm(columnId) {
  taskDraft.id = null
  taskDraft.columnId = columnId
  taskDraft.title = ''
  taskDraft.description = ''
  taskDraft.priority = 'medium'
  taskDraft.assignee = ''
}

function editTask(task, columnId) {
  taskDraft.id = task.id
  taskDraft.columnId = columnId
  taskDraft.title = task.title
  taskDraft.description = task.description
  taskDraft.priority = task.priority
  taskDraft.assignee = task.assignee
}

function submitTask() {
  if (!taskDraft.title.trim() || !taskDraft.columnId) return

  if (taskDraft.id) {
    store.updateTask(taskDraft.columnId, { ...taskDraft })
  } else {
    store.addTask(taskDraft.columnId, { ...taskDraft })
  }

  openTaskForm(taskDraft.columnId)
}

function handleDragStart(payload) {
  dragging.value = payload
}

function handleDrop({ toColumnId, targetTaskId = null }) {
  if (!dragging.value) return
  store.moveTask({ ...dragging.value, toColumnId, targetTaskId })
  dragging.value = null
}
</script>

<template>
  <div class="app-shell">
    <BoardHeader
      :theme="store.theme"
      :search="store.search"
      :priority-filter="store.priorityFilter"
      @toggle-theme="store.toggleTheme"
      @update-search="store.search = $event"
      @update-priority="store.priorityFilter = $event"
    />

    <main class="workspace">
      <section class="hero-panel">
        <div>
          <p class="eyebrow">Kanban workspace</p>
          <h1>Planifica entregables con una experiencia entre Notion y Trello.</h1>
          <p>
            Crea columnas, agrega tareas, edita, elimina y reordena con drag and drop. Todo queda
            persistido en LocalStorage.
          </p>
        </div>

        <form class="column-form" @submit.prevent="createColumn">
          <label>
            <span>Nueva columna</span>
            <input v-model="columnForm.title" type="text" placeholder="Ejemplo: QA" />
          </label>
          <label>
            <span>Color</span>
            <input v-model="columnForm.tone" type="color" />
          </label>
          <button type="submit">Crear columna</button>
        </form>
      </section>

      <section class="task-editor">
        <div>
          <p class="eyebrow">Task editor</p>
          <h2>{{ isEditingTask ? 'Editar tarea' : 'Crear tarea' }}</h2>
        </div>

        <form class="task-form" @submit.prevent="submitTask">
          <select v-model="taskDraft.columnId">
            <option disabled value="">Selecciona una columna</option>
            <option v-for="column in store.columns" :key="column.id" :value="column.id">{{ column.title }}</option>
          </select>
          <input v-model="taskDraft.title" type="text" placeholder="Titulo de la tarea" />
          <textarea v-model="taskDraft.description" rows="3" placeholder="Describe el entregable"></textarea>
          <div class="task-form__row">
            <select v-model="taskDraft.priority">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input v-model="taskDraft.assignee" type="text" placeholder="Responsable" />
          </div>
          <button type="submit">{{ isEditingTask ? 'Guardar cambios' : 'Agregar tarea' }}</button>
        </form>
      </section>

      <section class="board-grid">
        <ColumnCard
          v-for="column in visibleColumns"
          :key="column.id"
          :column="column"
          @add-task="openTaskForm"
          @delete-column="store.deleteColumn"
          @edit-task="editTask"
          @delete-task="store.deleteTask"
          @drag-start="handleDragStart"
          @drop-task="handleDrop"
        />
      </section>
    </main>
  </div>
</template>
