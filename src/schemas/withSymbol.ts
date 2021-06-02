import { reactive } from '@/modules/reactive'
import { __components__, __props__ } from '@/modules/fire'

export default reactive({
  [__components__]: [
    function example() {
      console.log('Yeah')
    },
  ],
  [__props__]: {
    textContent: 'Yeah',
  },
})
