<template>
  <FormInput
    v-if="formInput"
    :id-label="`input-${id}`"
    :placeholder="isVisible ? 'H<3j,G;%' : '**********'"
    :title="title || t('password')"
    :type="isVisible ? 'text' : 'password'"
    :value="formInput"
    @input="emit('input', $event)"
    @icon="isVisible = !isVisible"
  >
    <template #inputSuffix>
      <slot />
    </template>
    <template #icon>
      <IconEye v-if="!isVisible" />
      <IconEyeOff v-else />
    </template>
    <template #stateError>
      <FormInputStateError
        :form-input="formInput"
        validation-property="lengthMin"
      >
        {{ t('globalValidationShortness') }}
      </FormInputStateError>
      <FormInputStateError
        :form-input="formInput"
        validation-property="required"
      >
        {{ t('globalValidationRequired') }}
      </FormInputStateError>
      <FormInputStateError :form-input="formInput" validation-property="sameAs">
        {{ t('globalValidationSameAs') }}
      </FormInputStateError>
    </template>
    <template #stateInfo>
      <FormInputStateInfo
        :form-input="formInput"
        validation-property="lengthMin"
      >
        {{
          t('validationFormat', { length: VALIDATION_PASSWORD_LENGTH_MINIMUM })
        }}
      </FormInputStateInfo>
      <slot name="stateInfo" />
    </template>
  </FormInput>
</template>

<script setup lang="ts">
import type { BaseValidation } from '@vuelidate/core'

export interface Props {
  id?: string
  formInput: BaseValidation
  title?: string
}
withDefaults(defineProps<Props>(), {
  id: 'password',
  title: undefined,
})

const emit = defineEmits<{
  input: [event: string]
}>()

const { t } = useI18n()

// data
const isVisible = ref(false)
</script>

<i18n lang="yaml">
de:
  password: Passwort
  validationFormat: Muss {length} Zeichen lang sein
en:
  password: Password
  validationFormat: Must be {length} characters long
</i18n>
