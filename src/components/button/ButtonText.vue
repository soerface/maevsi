<template>
  <Button
    :is-to-relative="isToRelative"
    :aria-label="ariaLabel"
    class="px-4 py-2 font-medium"
    :disabled="disabled"
    :to="to"
    :type="type"
    @click="emit('click')"
  >
    <slot />
    <template #prefix>
      <slot name="prefix" />
    </template>
    <template #suffix>
      <slot name="suffix" />
    </template>
  </Button>
</template>

<script setup lang="ts">
export interface Props {
  ariaLabel: string
  disabled?: boolean
  isToRelative?: boolean
  to?: string
  type?: 'button' | 'reset' | 'submit'
}
withDefaults(defineProps<Props>(), {
  disabled: false,
  isToRelative: false,
  to: undefined,
  type: 'button',
})

const emit = defineEmits<{
  click: []
}>()
</script>
