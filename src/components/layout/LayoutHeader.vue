<template>
  <!-- <Loader :api="api" indicator="ping"> -->
  <header class="mb-8">
    <div class="flex items-center justify-between gap-4">
      <ButtonIcon
        :aria-label="t('menuShow')"
        class="lg:hidden"
        @click="emit('onMenuShow')"
      >
        <IconBars3 classes="h-8 w-8" />
      </ButtonIcon>
      <Button :aria-label="t('home')" :to="localePath('/')">
        <IconLogoWithText class="h-10 w-32" />
      </Button>
      <div class="hidden flex-grow lg:block" />
      <div class="hidden flex-nowrap lg:flex">
        <label class="hidden" for="search">{{ t('search') }}</label>
        <input
          id="search"
          class="form-input cursor-pointer rounded-r-none dark:border-gray-500 dark:bg-gray-700 dark:placeholder:text-gray-300"
          :placeholder="t('search')"
          readonly
          type="text"
          @click="navigateToSearch"
        />
        <span
          class="inline-flex cursor-pointer items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-300"
          @click="navigateToSearch"
        >
          <IconMagnifyingGlass />
        </span>
      </div>
      <div class="hidden flex-grow lg:block" />
      <div class="flex items-center gap-2 whitespace-nowrap lg:gap-4">
        <ButtonText
          :aria-label="t('events')"
          class="hidden lg:flex"
          :to="localePath('/events')"
          :is-primary="false"
        >
          {{ t('events') }}
          <template #prefix>
            <IconTelescope />
          </template>
        </ButtonText>
        <ButtonEventNew class="hidden lg:flex" />
        <div
          class="my-1 hidden w-px flex-none self-stretch bg-gray-300 dark:bg-gray-600 lg:flex"
        />
        <ButtonColored
          v-if="store.signedInAccountId"
          :aria-label="t('dashboard')"
          class="mx-2 hidden lg:block"
          :is-primary="false"
          :to="localePath('/dashboard')"
        >
          {{ t('dashboard') }}
        </ButtonColored>
        <ButtonIcon
          v-if="store.signedInUsername && store.signedInAccountId"
          :aria-label="store.signedInUsername"
          :title="t('profileLink')"
          :to="localePath(`/accounts/${store.signedInUsername}`)"
        >
          <AccountProfilePicture
            :account-id="store.signedInAccountId"
            classes="h-10 rounded-full w-10"
            height="40"
            width="40"
          />
        </ButtonIcon>
        <template v-else>
          <ButtonIcon
            :aria-label="t('signIn')"
            class="h-8 w-8 lg:hidden"
            :to="localePath('/tasks/accounts/sign-in')"
          >
            <IconSignIn classes="h-6 w-6" />
          </ButtonIcon>
          <ButtonText
            :aria-label="t('signIn')"
            class="hidden lg:inline-block"
            :to="localePath('/tasks/accounts/sign-in')"
          >
            {{ t('signIn') }}
          </ButtonText>
        </template>
      </div>
    </div>
  </header>
  <!-- </Loader> -->
</template>

<script setup lang="ts">
// import { getAccountItem } from '~/gql/documents/fragments/accountItem'
// import { useAccountByUsernameQuery } from '~/gql/documents/queries/account/accountByUsername'

const emit = defineEmits<{
  onMenuShow: []
}>()

const store = useMaevsiStore()
const localePath = useLocalePath()
const { t } = useI18n()

// // api data
// const accountByUsernameQuery = store.signedInUsername
//   ? await useAccountByUsernameQuery({
//       username: store.signedInUsername,
//     })
//   : undefined
// const account = getAccountItem(
//   accountByUsernameQuery?.data.value?.accountByUsername,
// )
// const api = getApiData([accountByUsernameQuery])

// methods
const navigateToSearch = () => {
  navigateTo({
    path: localePath(`/tasks/search`),
    query: { q: 'search phrase' },
  })
}
</script>

<i18n lang="yaml">
de:
  dashboard: Dashboard
  events: Veranstaltungen entdecken
  home: Nach Hause
  menuShow: Menü anzeigen
  profileLink: Profilseite anzeigen
  search: Suche
  signIn: Anmelden
en:
  dashboard: Dashboard
  events: Explore events
  home: Head home
  menuShow: Show menu
  profileLink: Show profile page
  search: Search
  signIn: Sign in
</i18n>
