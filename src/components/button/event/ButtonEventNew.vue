<template>
  <ButtonText
    :aria-label="t('new')"
    :to="localePath('/tasks/events/create')"
    @click="emit('click')"
  >
    {{ t('new') }}
    <template #prefix>
      <IconPlus />
    </template>
  </ButtonText>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()

const emit = defineEmits<{
  click: []
}>()
</script>

<i18n lang="yaml">
de:
  new: Veranstaltung erstellen
en:
  new: Create event
</i18n>
