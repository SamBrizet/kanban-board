<script setup>
import { autoAnimate } from '@formkit/auto-animate'
import { onMounted, ref } from 'vue'

const props = defineProps({
  column: { type: Object, required: true },
})

const emit = defineEmits(['add-task', 'delete-column', 'delete-task', 'drag-start', 'drop-task', 'edit-task'])
const taskList = ref(null)
const columnEl = ref(null)
const isCollapsed = ref(false)

onMounted(() => {
  if (taskList.value) {
    autoAnimate(taskList.value)
  }
  if (columnEl.value) {
    autoAnimate(columnEl.value)
  }
})

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

function onDragStart(task) {
  emit('drag-start', { fromColumnId: props.column.id, taskId: task.id })
}

function onDrop(targetTaskId = null) {
  emit('drop-task', { toColumnId: props.column.id, targetTaskId })
}
</script>

<template>
  <article
    ref="columnEl"
    class="column-card"
    :class="{ 'column-card--collapsed': isCollapsed }"
    :style="{ '--column-tone': column.tone || '#6366f1' }"
    @dragover.prevent
    @drop="onDrop()"
  >
    <header class="column-card__header" @click="toggleCollapse">
      <div class="column-card__header-left">
        <span class="column-dot"></span>
        <strong class="column-title">{{ column.title }}</strong>
        <span class="column-count-badge">
          {{ column.tasks ? column.tasks.length : 0 }}
        </span>
      </div>

      <div class="column-card__header-actions">
        <button
          type="button"
          class="column-btn column-btn--delete"
          title="Eliminar columna"
          aria-label="Eliminar columna"
          @click.stop="emit('delete-column', column.id)"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>

        <button
          type="button"
          class="column-btn column-btn--collapse"
          :class="{ 'is-collapsed': isCollapsed }"
          :title="isCollapsed ? 'Expandir columna' : 'Colapsar columna'"
          :aria-label="isCollapsed ? 'Expandir columna' : 'Colapsar columna'"
          @click.stop="toggleCollapse"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Collapsed preview hint on mobile / desktop -->
    <div v-if="isCollapsed" class="column-collapsed-hint" @click="toggleCollapse">
      <span>{{ column.tasks.length }} {{ column.tasks.length === 1 ? 'tarea' : 'tareas' }} &bull; Clic para expandir</span>
    </div>

    <!-- Column content when expanded -->
    <template v-else>
      <div ref="taskList" class="task-list">
        <div v-if="column.tasks.length === 0" class="task-list__empty">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <p>No hay tareas aquí</p>
        </div>

        <article
          v-for="task in column.tasks"
          :key="task.id"
          class="task-card"
          draggable="true"
          @dragstart="onDragStart(task)"
          @dragover.prevent
          @drop="onDrop(task.id)"
        >
          <div class="task-card__meta">
            <span :class="['priority-pill', `priority-pill--${task.priority}`]">
              <span class="priority-dot"></span>
              {{ task.priority }}
            </span>
            <span class="assignee-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>{{ task.assignee || 'Sin asignar' }}</span>
            </span>
          </div>

          <h3 class="task-card__title">{{ task.title }}</h3>
          <p v-if="task.description" class="task-card__desc">{{ task.description }}</p>

          <div class="task-card__actions">
            <button
              type="button"
              class="task-action-btn"
              title="Editar tarea"
              @click="emit('edit-task', task, column.id)"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Editar
            </button>
            <button
              type="button"
              class="task-action-btn task-action-btn--delete"
              title="Eliminar tarea"
              @click="emit('delete-task', column.id, task.id)"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Eliminar
            </button>
          </div>
        </article>
      </div>

      <button type="button" class="add-task-quick-btn" @click="emit('add-task', column.id)">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>Agregar tarea</span>
      </button>
    </template>
  </article>
</template>