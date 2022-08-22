import { defineComponent } from '#app'

import Modal from './Modal.vue'
import { useMaevsiStore } from '~/store'

export default {
  component: Modal,
  title: 'modal/Modal',
}

const Template = (_: never, { argTypes }: any) =>
  defineComponent({
    components: { Modal },
    props: Object.keys(argTypes),
    setup() {
      const store = useMaevsiStore()
      store.modalAdd({
        contentBody: 'contentBody',
        id: 'Modal',
        isVisible: true,
      })
    },
    // eslint-disable-next-line @intlify/vue-i18n/no-raw-text
    template: '<Modal v-bind="$props" id="Modal">Modal</Modal>',
  })

export const Default = Template.bind({})
// @ts-ignore
Default.args = {
  submitName: 'submitName',
  submitTaskProvider: () => Promise.resolve(),
}
