import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar, Dialog, Notify, Dark } from 'quasar'
import langEs from 'quasar/lang/es'

import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import '@/styles/main.scss'

import App from './App.vue'
import router from './router'

const THEME_STORAGE_KEY = 'mi_presupuesto_theme'
const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
const isDark = savedTheme === 'dark'

Dark.set(isDark)

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(Quasar, {
  plugins: {
    Dialog,
    Notify,
    Dark
  },
  config: {
    dark: isDark
  },
  lang: langEs
})
app.use(router)

app.mount('#app')

