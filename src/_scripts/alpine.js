import Alpine from 'alpinejs'
import global from './global.js'

Alpine.data('global', global)

Alpine.directive(
  'else',
  (el, { expression, modifiers }, { evaluateLater, cleanup }) => {
    const previous = el.previousElementSibling

    if (!previous || previous.tagName.toLowerCase() !== 'template' || !previous.hasAttribute('x-if')) {
      throw new Error('`x-else` encountered without a previous `x-if` sibling.')
    }

    el.setAttribute('x-if', `! (${previous.getAttribute('x-if')})`)
  }
)

window.Alpine = Alpine

// Start Alpine when the page is ready.
window.addEventListener('DOMContentLoaded', () => {
  Alpine.start()
});

// // Basic Store Example in Alpine.
// window.addEventListener('alpine:initializing', () => {
//   Alpine.store('nav', {
//     isOpen: false,
//     close() { return this.isOpen = false },
//     open() { return this.isOpen = true },
//     toggle() { return this.isOpen = !this.isOpen }
//   })
// })

window.addEventListener('alpine:initializing', () => {
  Alpine.store('auth', {
    user: null,
    setUser(user) {
      this.user = user
    },
    init() {
      const token = localStorage.getItem('friendzone_token')
      if (token) {
        fetch('/api/auth', {
          method: 'POST',
          body: token,
        })
          .then((response) => response.json())
          .then((message) => {
            if (message.success) this.user = message.user
          })
      }
    },
  })
})
