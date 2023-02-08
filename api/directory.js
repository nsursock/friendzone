import { createClient } from '@supabase/supabase-js'

export default async function handler(request, response) {
  try {

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    )

    switch (request.query.mode) {

      case 'connect':
        const { user1, user2, status } = request.body
        var table = process.env.NODE_ENV.startsWith('dev')
          ? 'relationships.dev'
          : 'relationships.dev'

        var { data, error } = await supabase.from(table).insert({
          user1, user2, status
        }).select('*')

        if (error) throw new Error(error)
        response.status(200).json({ success: true })
        break

      case 'invite':
        const { email } = request.body
        var table = process.env.NODE_ENV.startsWith('dev')
          ? 'relationships.dev'
          : 'relationships.dev'

        var data = (await supabase.from(table)
          .select(`id, created_at, user1 (first_name, last_name, avatar_url)`)
          .eq('user2', email).eq('status', 'Pending')).data
        response.status(200).json({ data })
        break

      case 'Accepted':
      case 'Declined':
        var table = process.env.NODE_ENV.startsWith('dev')
          ? 'relationships.dev'
          : 'relationships.dev'

        await supabase.from(table).update({
          status: request.query.mode
        }).eq('id', request.query.id)
        response.status(200).json({ success: true })
        break

      case 'profile':
        var table = process.env.NODE_ENV.startsWith('dev')
          ? 'users.dev'
          : 'users.dev'

        var data = (await supabase.from(table).select().eq('email', request.query.email)).data[0]
        response.status(200).json({ data })
        break

      case 'friends':
        var table = process.env.NODE_ENV.startsWith('dev')
          ? 'relationships.dev'
          : 'relationships.dev'

        let statuses = []
        if (request.query.minimum === 'pending')
          statuses = ['Pending', 'Accepted']
        else if (!request.query.minimum || request.query.minimum === 'accepted')
          statuses = ['Accepted']

        var { data, error } = (await supabase.from(table)
          .select(`user1 (id, first_name, last_name, user_name, avatar_url, cover_url, title, city, email, phone_number, country, birthday, description)`)
          .eq('user2', request.query.email).in('status', statuses))
        const data1 = JSON.parse(JSON.stringify(data).split('"user1":').join('"friend":'))
        if (error) throw new Error(error)

        var { data, error } = (await supabase.from(table)
          .select(`user2 (id, first_name, last_name, user_name, avatar_url, cover_url, title, city, email, phone_number, country, birthday, description)`)
          .eq('user1', request.query.email).in('status', statuses))
        const data2 = JSON.parse(JSON.stringify(data).split('"user2":').join('"friend":'))
        if (error) throw new Error(error)

        var data = data1.concat(data2)?.map((o) => o = {
          ...o.friend,
          full_name: o.friend.last_name + ' ' + o.friend.first_name
        })

        response.status(200).json({ data })
        break

      default:
        var table = process.env.NODE_ENV.startsWith('dev')
          ? 'users.dev'
          : 'users.dev'

        var data = (await supabase.from(table).select())
          .data.map((o) => o = {
            ...o,
            full_name: o.last_name + ' ' + o.first_name
          })
        response.status(200).json({ data })
        break

    }

  } catch (error) {
    console.log(error);
    response.status(400).json({ message: 'Failed to manipulate users.' })
  }
}
