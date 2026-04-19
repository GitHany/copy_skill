import DefaultTheme from 'vitepress/theme'
import './style.css'
import CommandLayout from './CommandLayout.vue'

export default {
  extends: DefaultTheme,
  Layout: CommandLayout
}
