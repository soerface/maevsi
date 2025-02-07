<template>
  <div>
    <SBreadcrumb :items="breadcrumbItems" :ui="BREADCRUMBS_UI" />
    <h1>
      {{ title }}
    </h1>
    <div
      v-if="store.jwtDecoded?.role === 'maevsi_account'"
      class="flex flex-col gap-4"
    >
      <div class="flex gap-4">
        <section class="lg:w-1/2">
          <h2>{{ t('eventsMine') }}</h2>
          <ButtonColored
            :aria-label="t('eventsMine')"
            :to="localePath(`/events/${store.signedInUsername}`)"
          >
            {{ t('eventsMine') }}
            <template #prefix>
              <IconCalendar />
            </template>
          </ButtonColored>
        </section>
        <section class="lg:w-1/2">
          <h2>{{ t('invitationsMine') }}</h2>
          <CardStateInfo>
            {{ t('invitationsMineDescription') }}
          </CardStateInfo>
        </section>
      </div>
      <div class="flex gap-4">
        <section class="lg:w-1/2">
          <h2>{{ t('contactsMine') }}</h2>
          <ButtonColored
            :aria-label="t('contactBook')"
            :to="localePath('/contacts')"
          >
            {{ t('contactBook') }}
            <template #prefix>
              <IconAddressBook />
            </template>
          </ButtonColored>
        </section>
        <section class="lg:w-1/2">
          <h2>{{ t('uploadsMine') }}</h2>
          <ButtonColored
            :aria-label="t('gallery')"
            :to="localePath('/uploads')"
          >
            {{ t('gallery') }}
            <template #prefix>
              <IconImages />
            </template>
          </ButtonColored>
        </section>
      </div>
      <section>
        <h2>{{ t('news') }}</h2>
        <CardStateInfo>
          {{ t('newsDescription') }}
        </CardStateInfo>
      </section>
    </div>
    <LayoutCallToAction
      v-else
      :call-to-action="t('anonymousCta')"
      :call-to-action-description="t('anonymousCtaDescription')"
    />
  </div>
</template>

<script lang="ts">
import { usePageBreadcrumb as usePageBreadcrumbHome } from '../index.vue'

export const usePageBreadcrumb = () => ({
  label: 'Dashboard',
  to: '/dashboard',
})
</script>

<script setup lang="ts">
const { t, locale } = useI18n()
const store = useMaevsiStore()
const localePath = useLocalePath()
const getBreadcrumbItemProps = useGetBreadcrumbItemProps()

// data
const breadcrumbItems = defineBreadcrumbItems(
  getBreadcrumbItemProps(
    [
      usePageBreadcrumbHome(),
      {
        current: true,
        ...usePageBreadcrumb(),
      },
    ],
    locale,
  ),
)
const title = t('title')

// initialization
useHeadDefault({ title })
</script>

<i18n lang="yaml">
de:
  anonymousCta: Finde ihn auf maevsi
  anonymousCtaDescription: Dir fehlt der Überblick über Veranstaltungen?
  contactBook: Kontaktbuch
  contactsMine: Meine Kontake
  eventsMine: Meine Veranstaltungen
  gallery: Bildergalerie
  invitationsMine: Meine Einladungen
  invitationsMineDescription: Hier wirst du bald die Veranstaltungen sehen, zu denen du eingeladen bist.
  news: Ereignisverlauf
  newsDescription: Hier wirst du bald alle für dich relevanten Neuigkeiten sehen.
  title: Dashboard
  uploadsMine: Meine Uploads
en:
  anonymousCta: Find it on maevsi
  anonymousCtaDescription: Are you missing an overview of events?
  contactBook: Contact book
  contactsMine: My contacts
  eventsMine: My events
  gallery: Image gallery
  invitationsMine: My invitations
  invitationsMineDescription: Here you will soon see the events to which you are invited.
  news: Recent changes
  newsDescription: Here you will soon see all the news relevant to you.
  title: Dashboard
  uploadsMine: My uploads
</i18n>
