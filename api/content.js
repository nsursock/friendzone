import { createClient } from '@supabase/supabase-js'

export default async function handler(request, response) {
  try {

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    )

    var table = process.env.NODE_ENV.startsWith('dev')
      ? 'messages.dev'
      : 'messages'

    switch (request.query.mode) {

      case 'post':
        const { author, content, relatedId } = request.body

        var { data, error } = await supabase.from(table).insert({
          author, content, related_id: relatedId
        }).select('*')

        if (error) throw new Error(error)
        response.status(200).json({ success: true })
        break

      case 'display':

        var tableRel = process.env.NODE_ENV.startsWith('dev')
          ? 'relationships.dev'
          : 'relationships'

        var data1 = (await supabase.from(tableRel)
          .select(`user1 (id, first_name, last_name, avatar_url, title, city, email, phone_number)`)
          .eq('user2', request.query.email).eq('status', 'Accepted')).data
        data1 = JSON.parse(JSON.stringify(data1).split('"user1":').join('"friend":'))

        var data2 = (await supabase.from(tableRel)
          .select(`user2 (id, first_name, last_name, avatar_url, title, city, email, phone_number)`)
          .eq('user1', request.query.email).eq('status', 'Accepted')).data
        data2 = JSON.parse(JSON.stringify(data2).split('"user2":').join('"friend":'))

        var emails = data1.concat(data2)
        emails = emails.map((item) => item.friend.email)
        emails.push(request.query.email)

        var { data, error } = (await supabase.from(table)
          .select('id, created_at, related_id, author ( first_name, last_name, avatar_url ), content, num_like, num_impr')
          .in('author', emails))
        if (error) console.log(error)

        response.status(200).json({ data })
        break
    }

  } catch (error) {
    console.log(error);
    response.status(400).json({ message: 'Failed to manipulate messages.' })
  }
}
