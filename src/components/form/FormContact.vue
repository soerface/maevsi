<template>
  <Form
    class="flex min-h-0 flex-col"
    :errors="api.errors"
    :errors-pg-ids="{
      postgres23505: t('postgres23505'),
    }"
    :form="v$"
    :is-form-sent="isFormSent"
    :submit-name="t('save')"
    @submit.prevent="submit"
  >
    <FormInput
      class="hidden"
      id-label="input-id"
      placeholder="id"
      title="id"
      type="text"
      :value="v$.id"
      @input="form.id = $event"
    />
    <FormInputUsername
      :form-input="v$.accountUsername"
      is-optional
      is-validatable
      @input="form.accountUsername = $event"
    >
      <template #icon>
        <IconMagnifyingGlass />
      </template>
    </FormInputUsername>
    <FormInputStateInfo>
      {{ t('accountOverride') }}
    </FormInputStateInfo>
    <FormInput
      id-label="input-first-name"
      is-optional
      :placeholder="t('globalPlaceholderFirstName')"
      :title="t('firstName')"
      type="text"
      :value="v$.firstName"
      @input="form.firstName = $event"
    >
      <template #stateError>
        <FormInputStateError
          :form-input="v$.firstName"
          validation-property="lengthMax"
        >
          {{ t('globalValidationLength') }}
        </FormInputStateError>
      </template>
    </FormInput>
    <FormInput
      id-label="input-last-name"
      is-optional
      :placeholder="t('globalPlaceholderLastName')"
      :title="t('lastName')"
      type="text"
      :value="v$.lastName"
      @input="form.lastName = $event"
    >
      <template #stateError>
        <FormInputStateError
          :form-input="v$.lastName"
          validation-property="lengthMax"
        >
          {{ t('globalValidationLength') }}
        </FormInputStateError>
      </template>
    </FormInput>
    <FormInputEmailAddress
      :form-input="v$.emailAddress"
      is-optional
      @input="form.emailAddress = $event"
    />
    <FormInput
      id-label="input-address"
      is-optional
      :title="t('address')"
      type="textarea"
      :value="v$.address"
      @input="form.address = $event"
    >
      <textarea
        v-if="v$.address"
        id="input-address"
        v-model.trim="v$.address.$model"
        class="form-input"
        :placeholder="t('globalPlaceholderAddress')"
        rows="2"
      />
      <template #stateError>
        <FormInputStateError
          :form-input="v$.address"
          validation-property="lengthMax"
        >
          {{ t('globalValidationLength') }}
        </FormInputStateError>
      </template>
    </FormInput>
    <FormInputPhoneNumber
      :form-input="v$.phoneNumber"
      is-optional
      @input="form.phoneNumber = $event"
    />
    <FormInputUrl :form-input="v$.url" is-optional @input="form.url = $event" />
  </Form>
</template>

<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core'

import { useCreateContactMutation } from '~/gql/documents/mutations/contact/contactCreate'
import { useUpdateContactByIdMutation } from '~/gql/documents/mutations/contact/contactUpdateById'
import type { ContactItemFragment } from '~/gql/generated/graphql'

export interface Props {
  contact?: Pick<ContactItemFragment, any>
}
const props = withDefaults(defineProps<Props>(), {
  contact: undefined,
})

const emit = defineEmits<{
  submitSuccess: []
}>()

const { $urql } = useNuxtApp()
const store = useMaevsiStore()
const { t } = useI18n()

// api data
const createContactMutation = useCreateContactMutation()
const updateContactByIdMutation = useUpdateContactByIdMutation()
const api = getApiData([createContactMutation, updateContactByIdMutation])

// data
const form = reactive({
  id: ref<string>(),
  accountUsername: ref<string>(),
  address: ref<string>(),
  emailAddress: ref<string>(),
  firstName: ref<string>(),
  lastName: ref<string>(),
  phoneNumber: ref<string>(),
  url: ref<string>(),
})
const isFormSent = ref(false)

// methods
const submit = async () => {
  if (!(await isFormValid({ v$, isFormSent }))) return

  const account = form.accountUsername
    ? await getAccountByUsername({
        $urql,
        username: form.accountUsername,
      })
    : undefined

  if (form.id) {
    // Edit
    const result = await updateContactByIdMutation.executeMutation({
      id: form.id,
      contactPatch: {
        accountId: account?.id || null,
        address: form.address || null,
        authorAccountId: store.signedInAccountId,
        emailAddress: form.emailAddress || null,
        firstName: form.firstName || null,
        lastName: form.lastName || null,
        phoneNumber: form.phoneNumber || null,
        url: form.url || null,
      },
    })

    if (result.error || !result.data) return

    emit('submitSuccess')
  } else {
    // Add
    const result = await createContactMutation.executeMutation({
      contactInput: {
        accountId: account?.id || null,
        address: form.address || null,
        authorAccountId: store.signedInAccountId,
        emailAddress: form.emailAddress || null,
        firstName: form.firstName || null,
        lastName: form.lastName || null,
        phoneNumber: form.phoneNumber || null,
        url: form.url || null,
      },
    })

    if (result.error || !result.data) return

    emit('submitSuccess')
  }
}
const updateForm = (data?: Pick<ContactItemFragment, any>) => {
  if (!data) return

  for (const [k, v] of Object.entries(data)) {
    ;(form as Record<string, any>)[k] = v
  }
}

// vuelidate
const rules = {
  id: {},
  accountUsername: VALIDATION_USERNAME({
    validateExistence: true,
  }),
  address: VALIDATION_PRIMITIVE({
    lengthMax: VALIDATION_ADDRESS_LENGTH_MAXIMUM,
  }),
  emailAddress: VALIDATION_EMAIL_ADDRESS({}),
  firstName: VALIDATION_PRIMITIVE({
    lengthMax: VALIDATION_NAME_FIRST_LENGTH_MAXIMUM,
  }),
  lastName: VALIDATION_PRIMITIVE({
    lengthMax: VALIDATION_NAME_LAST_LENGTH_MAXIMUM,
  }),
  phoneNumber: {},
  url: VALIDATION_URL(),
}
const v$ = useVuelidate(rules, form)

// lifecycle
watch(
  () => props.contact,
  (currentValue, _oldValue) => {
    updateForm(currentValue)
  },
)

// initialization
updateForm(props.contact)
</script>

<i18n lang="yaml">
de:
  accountOverride: Du kannst sowohl ein vorhandenes Konto als Kontakt hinzufügen als auch manuell Kontaktdaten eingeben. Sind beide Daten angegeben, werden die manuell eingebenen Daten bevorzugt verwendet.
  address: Adresse
  firstName: Vorname
  lastName: Nachname
  postgres23505: Ein Kontakt mit dieser Nutzernamen existiert bereits!
  save: Speichern
en:
  accountOverride: You can add an existing account as a contact or enter contact data manually. If both data are entered, the manually entered data will be used preferentially.
  address: Address
  firstName: First name
  lastName: Last name
  postgres23505: A contact with this username already exists!
  save: Save
</i18n>
