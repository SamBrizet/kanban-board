<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import BoardHeader from './components/BoardHeader.vue'
import ColumnCard from './components/ColumnCard.vue'
import { useKanbanStore } from './stores/kanbanStore.js'

const store = useKanbanStore()

const colorPresets = ['#6366f1', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e']
const columnForm = reactive({ title: '', tone: '#6366f1' })
const activePanel = ref(null) // 'task' | 'column' | null

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

function togglePanel(panel) {
  if (activePanel.value === panel) {
    activePanel.value = null
  } else {
    activePanel.value = panel
    if (panel === 'task' && !taskDraft.columnId && store.columns.length > 0) {
      taskDraft.columnId = store.columns[0].id
    }
  }
}

function closePanels() {
  activePanel.value = null
  taskDraft.id = null
  taskDraft.title = ''
  taskDraft.description = ''
  taskDraft.assignee = ''
}

function createColumn() {
  if (!columnForm.title.trim()) return
  store.addColumn({ ...columnForm })
  columnForm.title = ''
  activePanel.value = null
}

function openTaskForm(columnId) {
  taskDraft.id = null
  taskDraft.columnId = columnId || (store.columns[0]?.id || '')
  taskDraft.title = ''
  taskDraft.description = ''
  taskDraft.priority = 'medium'
  taskDraft.assignee = ''
  activePanel.value = 'task'
}

function editTask(task, columnId) {
  taskDraft.id = task.id
  taskDraft.columnId = columnId
  taskDraft.title = task.title
  taskDraft.description = task.description || ''
  taskDraft.priority = task.priority || 'medium'
  taskDraft.assignee = task.assignee || ''
  activePanel.value = 'task'
}

function submitTask() {
  if (!taskDraft.title.trim() || !taskDraft.columnId) return

  if (taskDraft.id) {
    store.updateTask(taskDraft.columnId, { ...taskDraft })
  } else {
    store.addTask(taskDraft.columnId, { ...taskDraft })
  }

  closePanels()
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
      :total-tasks="store.totalTasksCount"
      @toggle-theme="store.toggleTheme"
      @update-search="store.search = $event"
      @update-priority="store.priorityFilter = $event"
    />

    <main class="workspace">
      <!-- Hero Banner -->
      <section class="hero-panel">
        <div class="hero-panel__content">
          <div class="eyebrow">
            <span class="eyebrow__pulse"></span>
            Linear-style Kanban
          </div>
          <h1 class="hero-title">Flujo ágil con diseño moderno de alto rendimiento.</h1>
          <p class="hero-subtitle">
            Crea columnas, organiza tareas con drag & drop y gestiona prioridades.
            Diseño optimizado para pantallas táctiles y escritorios con sincronización automática en LocalStorage.
          </p>
        </div>

        <!-- Action bar buttons -->
        <div class="hero-actions">
          <button
            type="button"
            class="action-btn action-btn--primary"
            :class="{ 'action-btn--active': activePanel === 'task' }"
            @click="togglePanel('task')"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>{{ isEditingTask ? 'Editar tarea' : 'Nueva tarea' }}</span>
          </button>

          <button
            type="button"
            class="action-btn action-btn--secondary"
            :class="{ 'action-btn--active': activePanel === 'column' }"
            @click="togglePanel('column')"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
            <span>Nueva columna</span>
          </button>
        </div>
      </section>

      <!-- Collapsible Task Form Panel -->
      <transition name="expand">
        <section v-if="activePanel === 'task'" class="task-editor-panel">
          <div class="panel-header">
            <div class="panel-header__title">
              <span class="panel-dot"></span>
              <h3>{{ isEditingTask ? 'Editar tarea' : 'Crear nueva tarea' }}</h3>
            </div>
            <button type="button" class="panel-close-btn" aria-label="Cerrar panel" @click="closePanels">
              &times;
            </button>
          </div>

          <form class="task-form" @submit.prevent="submitTask">
            <div class="form-group">
              <label for="task-column">Columna destino</label>
              <select id="task-column" v-model="taskDraft.columnId" required>
                <option disabled value="">Selecciona una columna</option>
                <option v-for="column in store.columns" :key="column.id" :value="column.id">
                  {{ column.title }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="task-title">Título de la tarea</label>
              <input
                id="task-title"
                v-model="taskDraft.title"
                type="text"
                placeholder="Ej. Diseñar nueva pantalla de configuración"
                required
              />
            </div>

            <div class="form-group">
              <label for="task-desc">Descripción (opcional)</label>
              <textarea
                id="task-desc"
                v-model="taskDraft.description"
                rows="3"
                placeholder="Detalla los requerimientos o criterios de aceptación..."
              ></textarea>
            </div>

            <div class="task-form__row">
              <div class="form-group">
                <label for="task-priority">Prioridad</label>
                <select id="task-priority" v-model="taskDraft.priority">
                  <option value="low">Baja (Low)</option>
                  <option value="medium">Media (Medium)</option>
                  <option value="high">Alta (High)</option>
                </select>
              </div>

              <div class="form-group">
                <label for="task-assignee">Responsable</label>
                <input
                  id="task-assignee"
                  v-model="taskDraft.assignee"
                  type="text"
                  placeholder="Ej. Samanta"
                />
              </div>
            </div>

            <div class="form-buttons">
              <button type="button" class="btn-cancel" @click="closePanels">Cancelar</button>
              <button type="submit" class="btn-submit">
                {{ isEditingTask ? 'Guardar cambios' : 'Agregar tarea' }}
              </button>
            </div>
          </form>
        </section>
      </transition>

      <!-- Collapsible Column Form Panel -->
      <transition name="expand">
        <section v-if="activePanel === 'column'" class="column-editor-panel">
          <div class="panel-header">
            <div class="panel-header__title">
              <span class="panel-dot" :style="{ background: columnForm.tone }"></span>
              <h3>Crear nueva columna</h3>
            </div>
            <button type="button" class="panel-close-btn" aria-label="Cerrar panel" @click="closePanels">
              &times;
            </button>
          </div>

          <form class="column-form" @submit.prevent="createColumn">
            <div class="form-group">
              <label for="col-title">Nombre de la columna</label>
              <input
                id="col-title"
                v-model="columnForm.title"
                type="text"
                placeholder="Ejemplo: QA, En Revisión, Bloqueado..."
                required
              />
            </div>

            <div class="form-group">
              <label>Color distintivo</label>
              <div class="color-picker-row">
                <div class="color-presets">
                  <button
                    v-for="color in colorPresets"
                    :key="color"
                    type="button"
                    class="color-preset-dot"
                    :class="{ 'is-selected': columnForm.tone === color }"
                    :style="{ background: color }"
                    :aria-label="`Color ${color}`"
                    @click="columnForm.tone = color"
                  ></button>
                </div>
                <div class="custom-color-wrap">
                  <input v-model="columnForm.tone" type="color" class="custom-color-input" title="Elegir color personalizado" />
                  <span class="custom-color-label">{{ columnForm.tone }}</span>
                </div>
              </div>
            </div>

            <div class="form-buttons">
              <button type="button" class="btn-cancel" @click="closePanels">Cancelar</button>
              <button type="submit" class="btn-submit">Crear columna</button>
            </div>
          </form>
        </section>
      </transition>

      <!-- Kanban Board Columns Section -->
      <section class="board-container">
        <div class="board-grid">
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
        </div>
      </section>
    </main>
  </div>
</template>
