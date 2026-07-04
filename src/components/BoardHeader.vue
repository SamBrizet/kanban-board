<script setup>
defineProps({
  priorityFilter: { type: String, required: true },
  search: { type: String, required: true },
  theme: { type: String, required: true },
})

const emit = defineEmits(['toggle-theme', 'update-priority', 'update-search'])
</script>

<template>
  <header class="board-header">
    <div class="brand">
      <span class="brand__mark">KB</span>
      <div>
        <strong>Kanban Board</strong>
        <small>Flow planning system</small>
      </div>
    </div>

    <div class="board-header__controls">
      <input :value="search" type="search" placeholder="Buscar tareas o responsables" @input="emit('update-search', $event.target.value)" />
      <select :value="priorityFilter" @change="emit('update-priority', $event.target.value)">
        <option value="all">Todas las prioridades</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <button type="button" class="ghost-button" @click="emit('toggle-theme')">
        {{ theme === 'dark' ? 'Light mode' : 'Dark mode' }}
      </button>
    </div>
  </header>
</template>