import { format, formatRelative, formatDistance } from 'date-fns'

export default () => ({

  notifications: [],

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
      const { first_name, last_name, avatar_url } = invite.user1
      this
        .notifications
        .push({ type: 'connect', show: true, success: false, first_name, last_name, avatar_url })
    })

  },

  formatDate(date, dateFormat) {
    if (dateFormat === 'relative')
      return formatRelative(date, new Date())
    else if (dateFormat === 'distance')
      return formatDistance(date, new Date(), { addSuffix: true })
    else return format(date, dateFormat)
  },

})