<template>
  <Loader :api="api">
    <div
      v-if="event && event.accountByAuthorAccountId?.username"
      class="flex flex-col gap-4"
    >
      <SBreadcrumb :items="breadcrumbItems" :ui="BREADCRUMBS_UI" />
      <CardStateInfo v-if="routeQueryIc && contact" class="flex flex-col gap-2">
        {{ t('invitationViewFor', { name: contactName }) }}
        <ButtonColored
          is-to-relative
          :aria-label="t('invitationSelectionClear')"
          @click="
            navigateTo({
              path: append(route.path, 'invitations'),
              query: { ...routeQuery, ic: undefined },
            })
          "
        >
          {{ t('invitationSelectionClear') }}
          <template #prefix>
            <IconArrowLeft />
          </template>
        </ButtonColored>
      </CardStateInfo>
      <div v-if="contact" class="flex flex-col gap-2">
        <div class="flex items-center justify-between gap-2">
          <div>
            <p class="mb-2 text-2xl font-bold">
              {{
                t('greeting', {
                  usernameString: contactName ? ' ' + contactName : '',
                })
              }}
            </p>
            <p>{{ t('greetingDescription') }}</p>
          </div>
          <ButtonColored
            v-if="invitation?.feedback === 'ACCEPTED'"
            :aria-label="t('qrCodeShow')"
            @click="qrCodeShow"
          >
            {{ t('qrCodeShow') }}
            <template #prefix>
              <IconQrCode />
            </template>
          </ButtonColored>
        </div>
      </div>
      <ButtonList
        v-if="
          !routeQueryIc && event.authorAccountId === store.signedInAccountId
        "
        class="justify-center"
      >
        <ButtonColored
          is-to-relative
          :aria-label="t('invitations')"
          to="invitations"
        >
          {{ t('invitations') }}
          <template #prefix>
            <IconEnvelope />
          </template>
        </ButtonColored>
        <ButtonColored
          is-to-relative
          :aria-label="t('attendances')"
          to="attendances"
        >
          {{ t('attendances') }}
          <template #prefix>
            <IconUserCheck />
          </template>
        </ButtonColored>
        <ButtonColored is-to-relative :aria-label="t('settings')" to="settings">
          {{ t('settings') }}
          <template #prefix>
            <IconPencil />
          </template>
        </ButtonColored>
      </ButtonList>
      <div class="flex flex-col justify-between gap-4 md:flex-row">
        <div class="flex min-w-0 flex-col items-baseline md:flex-row md:gap-2">
          <h1 class="m-0">
            {{ event.name }}
          </h1>
          <Owner link :username="event.accountByAuthorAccountId.username" />
        </div>
        <div class="flex items-center gap-2">
          <ButtonColored
            :aria-label="t('iCalDownload')"
            :is-primary="false"
            @click="downloadIcal"
          >
            {{ t('iCalDownload') }}
            <template #prefix>
              <IconDownload />
            </template>
          </ButtonColored>
          <FormInputStateInfo :title="t('iCalHint')" />
        </div>
      </div>
      <Card v-if="event" class="flex flex-col items-stretch gap-8">
        <div class="flex flex-row flex-wrap justify-center self-stretch">
          <EventDashletStart :event="event" />
          <EventDashletDuration :event="event" />
          <EventDashletVisibility :event="event" with-text />
          <EventDashletAttendanceType :event="event" />
          <EventDashletLocation :event="event" />
          <EventDashletLink :event="event" />
        </div>
        <template v-if="invitation">
          <Hr />
          <div>
            <!-- <div
            class="grid grid-cols-6 border-t-2 bg-background-brighten dark:bg-background-darken"
            :class="
              invitation.feedback === 'ACCEPTED'
                ? 'border-green-600 dark:border-green-500'
                : invitation.feedback === 'CANCELED'
                ? 'border-red-600 dark:border-red-500'
                : 'border-text-dark dark:border-text-bright'
            "
          > -->
            <!-- <div
              v-if="invitation.feedback === 'ACCEPTED'"
              class="col-start-2 m-auto rounded-full bg-gray-500 px-2 text-text-bright"
            >
              {{ t('step1Of2') }}
            </div> -->
            <div
              class="flex flex-col items-center gap-2"
              :class="
                invitation.feedback === 'ACCEPTED' ? 'col-span-3' : 'col-span-6'
              "
            >
              <!-- <span v-if="event.authorUsername !== signedInUsername">
                {{ t('feedbackRequest') }}
              </span> -->
              <div class="flex items-center justify-center gap-4">
                <ButtonColored
                  v-if="
                    invitation.feedback === null ||
                    invitation.feedback === 'CANCELED'
                  "
                  :aria-label="
                    event.accountByAuthorAccountId.username !==
                    store.signedInUsername
                      ? t('invitationAccept')
                      : t('invitationAcceptAdmin', {
                          name: contactName,
                        })
                  "
                  @click="accept"
                >
                  {{
                    event.accountByAuthorAccountId.username !==
                    store.signedInUsername
                      ? t('invitationAccept')
                      : t('invitationAcceptAdmin', {
                          name: contactName,
                        })
                  }}
                  <template #prefix>
                    <IconCheckCircle />
                  </template>
                </ButtonColored>
                <div
                  v-if="invitation.feedback === 'ACCEPTED'"
                  class="flex items-center font-semibold text-green-600 dark:text-green-500"
                >
                  <IconCheckCircle class="mr-2" title="accepted" />
                  {{
                    event.accountByAuthorAccountId.username !==
                    store.signedInUsername
                      ? t('invitationAccepted')
                      : t('invitationAcceptedAdmin', {
                          name: contactName,
                        })
                  }}
                </div>
                <ButtonColored
                  v-if="
                    invitation.feedback === null ||
                    invitation.feedback === 'ACCEPTED'
                  "
                  :aria-label="
                    event.accountByAuthorAccountId.username !==
                    store.signedInUsername
                      ? t('invitationCancel')
                      : t('invitationCancelAdmin', {
                          name: contactName,
                        })
                  "
                  @click="cancel"
                >
                  {{
                    event.accountByAuthorAccountId.username !==
                    store.signedInUsername
                      ? t('invitationCancel')
                      : t('invitationCancelAdmin', {
                          name: contactName,
                        })
                  }}
                  <template #prefix>
                    <IconXCircle />
                  </template>
                </ButtonColored>
                <div
                  v-if="invitation.feedback === 'CANCELED'"
                  class="flex items-center font-semibold text-red-600 dark:text-red-500"
                >
                  <IconXCircle class="mr-2" title="canceled" />
                  {{
                    event.accountByAuthorAccountId.username !==
                    store.signedInUsername
                      ? t('invitationCanceled')
                      : t('invitationCanceledAdmin', {
                          name: contactName,
                        })
                  }}
                </div>
              </div>
            </div>
            <!-- <div
              v-if="
                invitation.feedback !== null &&
                invitation.feedback === 'ACCEPTED'
              "
              class="row-start-2 col-span-1 col-start-2 m-auto rounded-full bg-gray-500 px-2 text-text-bright"
            >
              {{ t('step2Of2') }}
            </div>
            <div
              v-if="
                invitation.feedback !== null &&
                invitation.feedback === 'ACCEPTED'
              "
              class="col-span-3"
            >
              <FormInput
                id-label="input-paper-invitation-feedback"
                :title="t('invitationCardKind')"
                type="select"
              >
                <select
                  id="input-paper-invitation-feedback"
                  v-model="invitation.feedbackPaper"
                  class="form-input"
                  @change="paperInvitationFeedback"
                >
                  <option disabled :value="null">
                    {{ t('requestSelection') }}
                  </option>
                  <option value="NONE">
                    {{ t('invitationCardKindNone') }}
                  </option>
                  <option value="PAPER">
                    {{ t('invitationCardKindPaper') }}
                  </option>
                  <option value="DIGITAL">
                    {{ t('invitationCardKindDigital') }}
                  </option>
                </select>
              </FormInput>
            </div> -->
          </div>
        </template>
        <template v-if="eventDescriptionTemplate">
          <Hr />
          <!-- eslint-disable vue/no-v-html -->
          <div
            class="vio-prose-scheme w-full"
            v-html="eventDescriptionTemplate"
          />
          <!-- eslint-enable vue/no-v-html -->
        </template>
      </Card>
      <Modal id="ModalInvitationQrCode">
        <div v-if="invitation" class="flex flex-col items-center gap-2 pb-4">
          <QrcodeVue
            id="qrCode"
            class="bg-white p-4"
            :value="invitation.id"
            :size="200"
          />
          <FormInputStateInfo>
            {{ t('hintQrCode') }}
          </FormInputStateInfo>
        </div>
        <template #footer>
          <ButtonColored
            :aria-label="t('print')"
            :is-primary="false"
            @click="print"
          >
            {{ t('print') }}
            <template #prefix>
              <IconPrinter />
            </template>
          </ButtonColored>
          <ButtonColored
            :aria-label="t('close')"
            @click="store.modalRemove('ModalInvitationQrCode')"
          >
            {{ t('close') }}
            <template #prefix>
              <IconX />
            </template>
          </ButtonColored>
        </template>
      </Modal>
    </div>
    <Error v-else :status-code="403" />
  </Loader>
</template>

<script lang="ts">
import { Client } from '@urql/core'
import downloadJs from 'downloadjs'
import DOMPurify from 'isomorphic-dompurify'
import mustache from 'mustache'
import prntr from 'prntr'
import QrcodeVue from 'qrcode.vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

import { usePageBreadcrumb as usePageBreadcrumbEventsUser } from '../index.vue'
import { usePageBreadcrumb as usePageBreadcrumbEvents } from '../../index.vue'
import { usePageBreadcrumb as usePageBreadcrumbHome } from '../../../index.vue'
import { useUpdateInvitationByIdMutation } from '~/gql/documents/mutations/invitation/invitationUpdateById'
import {
  InvitationFeedback,
  type InvitationItemFragment,
  type InvitationPatch,
} from '~/gql/generated/graphql'
import { useAccountByUsernameQuery } from '~/gql/documents/queries/account/accountByUsername'
import { getInvitationItem } from '~/gql/documents/fragments/invitationItem'
import { getEventItem } from '~/gql/documents/fragments/eventItem'
import { getAccountItem } from '~/gql/documents/fragments/accountItem'
import { getContactItem } from '~/gql/documents/fragments/contactItem'
import { useEventByAuthorAccountIdAndSlugQuery } from '~/gql/documents/queries/event/eventByAuthorAccountIdAndSlug'

export const pageBreadcrumb = async ({
  $urql,
  route,
}: {
  $urql: Ref<Client>
  route: RouteLocationNormalizedLoaded
}) => {
  const account = await getAccountByUsername({
    $urql,
    username: route.params.username as string,
  })
  const event = await getEventByAuthorAccountIdAndSlug({
    $urql,
    authorAccountId: account?.id,
    slug: route.params.event_name as string,
  })

  return {
    label: event?.name,
    to: `/events/${route.params.username as string}/${
      route.params.event_name as string
    }`,
  }
}
</script>

<script setup lang="ts">
definePageMeta({
  async validate(route) {
    return await validateEventExistence(route)
  },
})

const { $urql } = useNuxtApp()
const { t, locale } = useI18n()
const fireAlert = useFireAlert()
const store = useMaevsiStore()
const route = useRoute()
const updateInvitationByIdMutation = useUpdateInvitationByIdMutation()
const getBreadcrumbItemProps = useGetBreadcrumbItemProps()

// api data
const accountByUsernameQuery = await useAccountByUsernameQuery({
  username: route.params.username as string,
})
const accountId = computed(
  () =>
    getAccountItem(accountByUsernameQuery.data.value?.accountByUsername)?.id,
)
const eventQuery = await useEventByAuthorAccountIdAndSlugQuery({
  authorAccountId: accountId,
  slug: route.params.event_name as string,
  invitationId: route.query.ic,
})
const event = computed(() =>
  getEventItem(eventQuery.data.value?.eventByAuthorAccountIdAndSlug),
)
const api = getApiData([accountByUsernameQuery, eventQuery])

// data
const breadcrumbItems = defineBreadcrumbItems(
  getBreadcrumbItemProps(
    [
      usePageBreadcrumbHome(),
      usePageBreadcrumbEvents(),
      usePageBreadcrumbEventsUser(),
      {
        current: true,
        ...(await pageBreadcrumb({ $urql, route })),
      },
    ],
    locale,
  ),
)

// methods
const accept = () => {
  if (invitation.value === undefined) {
    return
  }
  update(invitation.value.id, {
    feedback: InvitationFeedback.Accepted,
  })
}
const cancel = () => {
  if (invitation.value === undefined) {
    return
  }
  update(invitation.value.id, {
    feedback: InvitationFeedback.Canceled,
  })
}
// const paperInvitationFeedback = () => {
//   if (!invitation.value) return

//   update(invitation.value.id, {
//     feedbackPaper: invitation.value.feedbackPaper,
//   })
// }
const downloadIcal = async () => {
  const response = await useFetch<string>('/api/ical', {
    body: {
      contact: contact.value,
      event: event.value,
      invitation: invitation.value,
    },
    method: 'POST',
  })
  const fileName =
    route.params.username + '_' + route.params.event_name + '.ics'

  if (!response.data.value) {
    return await fireAlert({
      level: 'error',
      text: t('iCalFetchError'),
    }) // TODO: add suggestion (https://github.com/maevsi/maevsi/issues/903) })
  }

  downloadJs(
    new Blob([response.data.value]), // Blob necessary for charset utf-8
    fileName,
    'text/calendar',
  )
}
const print = () => {
  prntr({
    printable: 'qrCode',
    type: 'html',
  })
}
const qrCodeShow = () => {
  store.modals.push({ id: 'ModalInvitationQrCode' })
}
const update = async (id: string, invitationPatch: InvitationPatch) => {
  const result = await updateInvitationByIdMutation.executeMutation({
    id,
    invitationPatch,
  })

  if (result.error || !result.data) return

  showToast({ title: t('success') })
}

// computations
const contact = computed(() =>
  getContactItem(invitation?.value?.contactByContactId),
)
const contactName = computed(() => {
  return invitation?.value?.contactByContactId && contact.value
    ? getContactName(contact.value)
    : undefined
})
const eventDescriptionTemplate = computed(() => {
  if (!event.value?.description) return

  return DOMPurify.sanitize(
    mustache.render(event.value.description, {
      contact: contact.value,
      event,
      invitation: invitation.value,
    }),
    { ADD_ATTR: ['target'] },
  )
})
const invitation = computed(() => {
  const invitations =
    eventQuery.data.value?.eventByAuthorAccountIdAndSlug?.invitationsByEventId.nodes
      .map((x) => getInvitationItem(x))
      .filter(isNeitherNullNorUndefined)

  const invitationsMatchingUuid =
    store.signedInUsername === route.params.username && invitations
      ? invitations.filter(
          (invitation: Pick<InvitationItemFragment, 'id'>) =>
            invitation.id === route.query.ic,
        )
      : invitations

  if (invitationsMatchingUuid?.length) {
    if (invitationsMatchingUuid.length > 1) {
      // TODO: use await (https://github.com/maevsi/maevsi/issues/61)
      fireAlert({
        level: 'warning',
        text: t('invitationIdMultipleWarning'),
      })
    }

    return invitationsMatchingUuid[0]
  }

  return undefined
})
const routeQuery = computed(() => route.query)
const routeQueryIc = computed(() => route.query.ic)
const descriptionSeo = computed(() =>
  eventDescriptionTemplate.value
    ? getStringTruncated({
        string: getTextFromHtml(eventDescriptionTemplate.value),
        limit: 200,
        isLastWordIncluded: true,
      })
    : undefined,
)
const title = computed(() =>
  api.value.isFetching ? t('globalLoading') : event.value?.name || '403',
)

// initialization
useHeadDefault({
  title,
  extension: {
    description: descriptionSeo,
  },
})
defineOgImage({
  alt: t('ogImageAlt'),
  component: 'Event',
  description: descriptionSeo.value,
})
</script>

<i18n lang="yaml">
de:
  attendances: Check-in
  close: Schließen
  # feedbackRequest: 'Bitte gib eine Rückmeldung, ob du teilnehmen wirst:'
  greeting: Hey{usernameString}!
  greetingDescription: Du wurdest zu folgender Veranstaltung eingeladen.
  hintQrCode: Dieses Bild ist deine Zugangsberechtigung für die Veranstaltung
  iCalDownload: Als Kalendereintrag herunterladen
  iCalHint: Die heruntergeladene Datei kann dann mit deiner Kalender-Anwendung geöffnet werden.
  iCalFetchError: iCal-Daten konnten nicht geladen werden!
  invitationAccept: Einladung annehmen
  invitationAcceptAdmin: Einladung im Namen von {name} annehmen
  invitationAccepted: Einladung angenommen
  invitationAcceptedAdmin: Einladung im Namen von {name} angenommen
  invitationCancel: Einladung ablehnen
  invitationCancelAdmin: Einladung im Namen von {name} ablehnen
  invitationCanceled: Einladung abgelehnt
  invitationCanceledAdmin: Einladung im Namen von {name} abgelehnt
  # invitationCardKind: Art der Einladungskarte
  # invitationCardKindNone: Keine
  # invitationCardKindPaper: Papier
  # invitationCardKindDigital: Digital
  invitationIdMultipleWarning: Es wurden mehrere Einladungscodes für dieselbe Veranstaltung eingelöst! Diese Seite zeigt die Daten des zuerst gefundenen an.
  invitationSelectionClear: Zurück zur Einladungsübersicht
  invitationViewFor: Du schaust dir die Einladung für {name} an. Nur du und {name} können diese Seite sehen.
  invitations: Einladungen
  ogImageAlt: Das Vorschaubild für die Veranstaltung.
  print: Drucken
  qrCodeShow: Check-in-Code anzeigen
  # requestSelection: Bitte auswählen
  settings: Bearbeiten
  # step1Of2: 1/2
  # step2Of2: 2/2
  success: Deine Eingabe wurde erfolgreich gespeichert.
en:
  attendances: Check in
  close: Close
  # feedbackRequest: 'Please confirm if you will attend:'
  greeting: Hey{usernameString}!
  greetingDescription: "You've been invited to the following event."
  hintQrCode: This picture is your access authorization for the event
  iCalDownload: Download for your calendar
  iCalHint: You can open the downloaded file in your calendar app.
  iCalFetchError: Could not get iCal data!
  invitationAccept: Accept invitation
  invitationAcceptAdmin: Accept invitation on behalf of {name}
  invitationAccepted: Invitation accepted
  invitationAcceptedAdmin: Invitation accepted on behalf of {name}
  invitationCancel: Decline invitation
  invitationCancelAdmin: Decline invitation on behalf of {name}
  invitationCanceled: Invitation declined
  invitationCanceledAdmin: Invitation declined on behalf of {name}
  # invitationCardKind: Type of invitation card
  # invitationCardKindNone: None
  # invitationCardKindPaper: Paper
  # invitationCardKindDigital: Digital
  invitationIdMultipleWarning: Multiple invitation codes have already been redeemed for the same event! This page shows data for the first code found.
  invitationSelectionClear: Back to the invitation overview
  invitationViewFor: You're viewing the invitation for {name}. Only you and {name} can see this page.
  invitations: Invitations
  ogImageAlt: The event's preview image.
  print: Print
  qrCodeShow: Show check in code
  # requestSelection: Please select
  settings: Edit
  # step1Of2: 1/2
  # step2Of2: 2/2
  success: Your input was saved succesfully.
</i18n>
