import Vue from 'vue'
import App from './App.vue'
import store from './store'
import VuePapaParse from 'vue-papa-parse'
import './assets/css/index.css'
import 'vue-tailwind-elements/src/tailwind-forms.min.css';
import VueTailwindElements from 'vue-tailwind-elements';
import VueShortKey from 'vue-shortkey'

Vue.use(VueTailwindElements)
Vue.use(VuePapaParse)
Vue.use(VueShortKey)

Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
