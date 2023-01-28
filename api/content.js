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

      case 'shared':
        var { data, error } = await supabase.from(table)
          .select('id, created_at, related_id, author ( first_name, last_name, avatar_url, city, country, website, birthday, user_name, description ), content, num_like, num_impr')
          .eq('id', request.query.id)
        if (error) console.log(error)

        response.status(200).json({ data: data[0] })
        break

      case 'favorites':
        var table = process.env.NODE_ENV.startsWith('dev')
          ? 'users.dev'
          : 'users'

        var { data, error } = await supabase.from(table).select('favorites')
          .eq('email', request.query.email)
        if (error) console.log(error)

        var table = process.env.NODE_ENV.startsWith('dev')
          ? 'trending2.dev'
          : 'trending2'

        var { data, error } = await supabase.from(table)
          .select('id, created_at, related_id, author ( first_name, last_name, avatar_url, city, country, website, birthday, user_name, description ), content, num_like, num_impr, num_ans')
          .in('id', data[0].favorites)

        response.status(200).json({ data })
        break

      case 'bookmark':
        var table = process.env.NODE_ENV.startsWith('dev')
          ? 'users.dev'
          : 'users'

        var { data, error } = await supabase.from(table).select('favorites')
          .eq('email', request.query.email)
        if (error) console.log(error)

        const favorites = data[0].favorites
        favorites.push(`${request.query.id}`)

        var { data, error } = await supabase
          .from(table)
          .update({ favorites })
          .eq('email', request.query.email)
        if (error) console.log(error)

        response.status(200).json({ data })
        break

      case 'trending':
        var { data, error } = (await supabase.from('trending2.dev')
          .select('id, created_at, related_id, author ( first_name, last_name, avatar_url, city, country, website, birthday, user_name, description ), content, num_like, num_impr, num_ans'))
        if (error) console.log(error)

        response.status(200).json({ data })
        break

      case 'increment':
        const field = 'num_' + request.query.field
        var { data, error } = await supabase.from(table)
          .select(field).eq('id', request.query.id)
        if (error) console.log(error)

        // console.log(data[0][field]) // http://localhost:8888/api/content?mode=increment&field=like&id=1
        var data2 = {}
        if (request.query.field === 'like')
          data2 = { num_like: data[0][field] === null ? 1 : data[0][field] + 1 }
        else if (request.query.field === 'impr')
          data2 = { num_impr: data[0][field] === null ? 1 : data[0][field] + 1 }
        else throw new Error('Invalid incremented field: ' + request.query.field)

        var { error } = await supabase.from(table).update(data2).eq('id', request.query.id)
        if (error) console.log(error)
        response.status(200).json({ success: true })
        break

      case 'post':
        const { author, content, relatedId } = request.body

        let object = {}
        if (content !== null) object = {
          author, content, related_id: relatedId
        }
        else object = {
          author, share_id: relatedId
        }

        var { data, error } = await supabase.from(table).insert(object).select('*')

        if (error) throw new Error(error)
        response.status(200).json({ success: true })
        break

      case 'comments':
        var { data, error } = (await supabase.from(table)
          .select('id, created_at, related_id, author ( first_name, last_name, avatar_url, city, country, website, birthday, user_name, description ), content, num_like, num_impr')
          .eq('related_id', request.query.id))
        if (error) console.log(error)

        response.status(200).json({ data })
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

        var { data, error } = await supabase.from(table)
          .select('id, created_at, related_id, share_id, author ( first_name, last_name, avatar_url, city, country, website, birthday, user_name, description ), content, num_like, num_impr')
          .in('author', emails).is('related_id', null).order('created_at', { ascending: false })
        if (error) console.log(error)

        var data2 = await Promise.all(data.map(async (item) => {
          var { data, error } = await supabase.from(table).select('id').eq('related_id', item.id)
          if (error) console.log(error)
          return { ...item, num_ans: data.length }
        }))

        response.status(200).json({ data: data2 })
        break
    }

  } catch (error) {
    console.log(error);
    response.status(400).json({ message: 'Failed to manipulate messages.' })
  }
}
