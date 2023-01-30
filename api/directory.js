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

      case 'friends':
        var table = process.env.NODE_ENV.startsWith('dev')
          ? 'relationships.dev'
          : 'relationships'

        var data1 = (await supabase.from(table)
          .select(`user1 (id, first_name, last_name, avatar_url, cover_url, title, city, email, phone_number, country, birthday, description)`)
          .eq('user2', request.query.email).eq('status', 'Accepted')).data
        data1 = JSON.parse(JSON.stringify(data1).split('"user1":').join('"friend":'))

        var data2 = (await supabase.from(table)
          .select(`user2 (id, first_name, last_name, avatar_url, cover_url, title, city, email, phone_number, country, birthday, description)`)
          .eq('user1', request.query.email).eq('status', 'Accepted')).data
        data2 = JSON.parse(JSON.stringify(data2).split('"user2":').join('"friend":'))

        var data = data1.concat(data2)
        // console.log(data);

        const check = data.reduce((sums, entry) => {
          sums[entry.friend.email] = (sums[entry.friend.email] || 0) + 1;
          return sums;
       },{})
       console.log(check);
       

        response.status(200).json({ data })
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
