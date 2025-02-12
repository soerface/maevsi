<template>
  <li
    v-if="event && event.accountByAuthorAccountId?.username"
    :class="{
      'opacity-75': eventEnd.isValid()
        ? eventEnd.isBefore(now)
        : eventStart.isBefore(now),
    }"
  >
    <Button
      :aria-label="event.name"
      is-block
      :to="
        localePath(
          '/events/' +
            event.accountByAuthorAccountId.username +
            '/' +
            event.slug,
        )
      "
    >
      <Card class="flex flex-col gap-2">
        <div class="flex items-center justify-between gap-2">
          <div
            class="truncate font-medium"
            :class="{
              'text-green-700 dark:text-green-600':
                eventStart.isSameOrAfter(now),
            }"
          >
            {{ eventStart.format('lll') }}
          </div>
          <Tag
            v-if="event.visibility === 'PRIVATE'"
            class="self-start text-sm font-medium"
          >
            <div class="flex items-center gap-1">
              <IconEyeOff classes="h-5 w-5" :title="t('private')" />
              {{ t('private') }}
            </div>
          </Tag>
        </div>
        <div class="flex items-baseline gap-2 truncate">
          <div class="truncate text-xl font-bold">
            {{ event.name }}
          </div>
          <Owner :username="event.accountByAuthorAccountId.username" />
        </div>
        <p v-if="eventDescriptionTemplate" class="vio-line-clamp-2">
          {{ eventDescriptionTemplate }}
        </p>
      </Card>
    </Button>
  </li>
</template>

<script setup lang="ts">
import DOMPurify from 'isomorphic-dompurify'
import mustache from 'mustache'
import type { EventItemFragment } from '~/gql/generated/graphql'

export interface Props {
  event: Pick<
    EventItemFragment,
    | 'name'
    | 'accountByAuthorAccountId'
    | 'start'
    | 'visibility'
    | 'slug'
    | 'end'
    | 'description'
  >
}
const props = withDefaults(defineProps<Props>(), {})

const localePath = useLocalePath()
const { t } = useI18n()
const dateTime = useDateTime()

// data
const now = dateTime()

// computations
const eventDescriptionTemplate = computed(() => {
  if (!props.event?.description) return

  return getTextFromHtml(
    DOMPurify.sanitize(
      mustache.render(props.event.description, {
        event: props.event,
      }),
    ),
  )
})
const eventEnd = computed(() => dateTime(props.event.end))
const eventStart = computed(() => dateTime(props.event.start))
</script>

<i18n lang="yaml">
de:
  private: privat
en:
  private: private
</i18n>
