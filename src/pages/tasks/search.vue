<template>
  <div>
    <SBreadcrumb :items="breadcrumbItems" :ui="BREADCRUMBS_UI" />
    <h1>{{ title }}</h1>
    <CardStateInfo>
      {{ t('filterSoon') }}
    </CardStateInfo>
  </div>
</template>

<script lang="ts">
import { usePageBreadcrumb as usePageBreadcrumbHome } from '../index.vue'

export const usePageBreadcrumb = () => ({
  label: {
    de: 'Suche',
    en: 'Search',
  },
  to: '/tasks/search',
})
</script>

<script setup lang="ts">
const { t, locale } = useI18n()
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
  filterSoon: Es wird bald möglich sein, nach Veranstaltungen oder Nutzern zu suchen.
  title: Suche
en:
  filterSoon: It will soon be possible to search for events or users.
  title: Search
</i18n>
