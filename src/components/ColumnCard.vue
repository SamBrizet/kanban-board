<script setup>
import { autoAnimate } from '@formkit/auto-animate'
import { onMounted, ref } from 'vue'

const props = defineProps({
  column: { type: Object, required: true },
})

const emit = defineEmits(['add-task', 'delete-column', 'delete-task', 'drag-start', 'drop-task', 'edit-task'])
const taskList = ref(null)

onMounted(() => {
  if (taskList.value) {
    autoAnimate(taskList.value)
  }
})

function onDragStart(task) {
  emit('drag-start', { fromColumnId: props.column.id, taskId: task.id })
}

function onDrop(targetTaskId = null) {
  emit('drop-task', { toColumnId: props.column.id, targetTaskId })
}
</script>

<template>
  <article class="column-card" :style="{ '--column-tone': column.tone }" @dragover.prevent @drop="onDrop()">
    <header class="column-card__header">
      <div>
        <span class="column-dot"></span>
        <strong>{{ column.title }}</strong>
      </div>
      <button type="button" class="icon-button" @click="emit('delete-column', column.id)">Eliminar</button>
    </header>

    <div ref="taskList" class="task-list">
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
          <span :class="['priority-pill', `priority-pill--${task.priority}`]">{{ task.priority }}</span>
          <small>{{ task.assignee || 'Sin asignar' }}</small>
        </div>
        <h3>{{ task.title }}</h3>
        <p>{{ task.description }}</p>
        <div class="task-card__actions">
          <button type="button" class="text-button" @click="emit('edit-task', task, column.id)">Editar</button>
          <button type="button" class="text-button" @click="emit('delete-task', column.id, task.id)">Eliminar</button>
        </div>
      </article>
    </div>

    <button type="button" class="ghost-button ghost-button--block" @click="emit('add-task', column.id)">
      + Agregar tarea
    </button>
  </article>
</template>