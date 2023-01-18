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
          : 'relationships'

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
          : 'relationships'

        var data = (await supabase.from(table)
          .select(`id, created_at, user1 (first_name, last_name, avatar_url)`)
          .eq('user2', email).eq('status', 'Pending')).data
        response.status(200).json({ data })
        break

      case 'Accepted':
      case 'Declined':
        var table = process.env.NODE_ENV.startsWith('dev')
          ? 'relationships.dev'
          : 'relationships'

        await supabase.from(table).update({
          status: request.query.mode
        }).eq('id', request.query.id)
        response.status(200).json({ success: true })
        break

      default:
        var table = process.env.NODE_ENV.startsWith('dev')
          ? 'users.dev'
          : 'users'

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
