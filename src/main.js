// module.exports = require('./VueTwemojiPicker.vue').default

import Vue from 'vue'
import VueTwemojiPicker from './VueTwemojiPicker.vue'
import smoothscroll from 'smoothscroll-polyfill';

smoothscroll.polyfill();

Vue.config.productionTip = false

new Vue({
  render: h => h(VueTwemojiPicker),
}).$mount('#app')
