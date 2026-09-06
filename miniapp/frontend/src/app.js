import { createApp } from 'vue'
import './app.css'

const App = createApp({})

// Retain the official qdmp template's Dimina/Vue setupState white-screen guard.
App.mixin({
  beforeCreate() {
    const setupState = this && this.$ && this.$.setupState
    if (!setupState || typeof setupState !== 'object') return
    try {
      const descriptor = Object.getOwnPropertyDescriptor(setupState, 'xs')
      if (descriptor?.writable) return
      Object.defineProperty(setupState, 'xs', {
        configurable: true, enumerable: false, writable: true, value: undefined,
      })
    } catch {
      console.warn('Dimina setupState guard could not be applied')
    }
  },
})
export default App
