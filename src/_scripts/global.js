import { format, formatRelative, formatDistance } from 'date-fns'

export default () => ({

  notifications: [],
  showNotifications: false,

  openNewPost: false,

  async getConnects() {
    const invites = (await (await fetch('/api/directory?mode=invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: Alpine.store('auth').user?.email
      })
    })).json()).data

    invites.map((invite) => {
      const { id, created_at, user1 } = invite
      const isAlreadyNotified = this.notifications.findIndex((notif) => notif.id === id) !== -1
      if (!isAlreadyNotified)
        this
          .notifications
          .push({ id, created_at, type: 'connect', show: true, success: false, user: user1 })
    })

  },

  formatDate(date, dateFormat) {
    if (dateFormat === 'relative')
      return formatRelative(date, new Date())
    else if (dateFormat === 'distance')
      return formatDistance(date, new Date(), { addSuffix: true })
    else return format(date, dateFormat)
  },

  isMobile() {
    const toMatch = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      // /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i
    ];

    return toMatch.some((toMatchItem) => {
      return navigator.userAgent.match(toMatchItem);
    });
  }

})