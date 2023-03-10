import { createClient } from '@supabase/supabase-js'

export default async function handler(request, response) {
  try {

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    )

    var table = process.env.NODE_ENV.startsWith('dev')
      ? 'messages.dev'
      : 'messages.dev'

    switch (request.query.mode) {

      case 'delete':
        var { data, error } = await supabase.from(table).delete().eq('id', request.query.id)
        if (error) console.log(error)

        if (request.query.level === 'one') {
          var { data, error } = await supabase.from(table).delete().eq('related_id', request.query.id).select('*')
          if (error) console.log(error)
        }

        if (request.query.level === 'zero' || request.query.level === 'one') {
          const ids = data.map((rec) => rec.id)
          var { data, error } = await supabase.from(table).delete().in('related_id', ids)
          if (error) console.log(error)
        }

        response.status(200).json({ success: true })
        break

      case 'shared':
        var { data, error } = await supabase.from(table)
          .select('id, created_at, related_id, author ( first_name, last_name, email, avatar_url, cover_url, city, country, website, birthday, user_name, description ), content, num_like, num_impr')
          .eq('id', request.query.id)
        if (error) console.log(error)

        response.status(200).json({ data: data[0] })
        break

      case 'favorites':
        var table = process.env.NODE_ENV.startsWith('dev')
          ? 'users.dev'
          : 'users.dev'

        var { data, error } = await supabase.from(table).select('favorites')
          .eq('email', request.query.email)
        if (error) console.log(error)

        var table = process.env.NODE_ENV.startsWith('dev')
          ? 'trending.dev'
          : 'trending.dev'

        var { data, error } = await supabase.from(table)
          .select('id, created_at, related_id, share_id, author ( first_name, last_name, email, avatar_url, cover_url, city, country, website, birthday, user_name, description ), content, num_like, num_impr, num_ans')
          .in('id', data[0].favorites ?? [])
        if (error) console.log(error)
        var data1 = data

        var shares = data.filter((rec) => rec.share_id !== null).map((rec) => rec.share_id)
        var { data, error } = await supabase.from(table)
          .select('id, created_at, related_id, share_id, author ( first_name, last_name, email, avatar_url, cover_url, city, country, website, birthday, user_name, description ), content, num_like, num_impr, num_ans')
          .in('id', shares ?? [])
        if (error) console.log(error)
        // data = data1.concat(data.map((rec) => rec = {...rec, display: false}))

        response.status(200).json({ data: data1, originals: data })
        break

      case 'bookmark':
        var table = process.env.NODE_ENV.startsWith('dev')
          ? 'users.dev'
          : 'users.dev'

        var { data, error } = await supabase.from(table).select('favorites')
          .eq('email', request.query.email)
        if (error) console.log(error)

        const favorites = data[0].favorites ?? []
        favorites.push(`${request.query.id}`)

        var { data, error } = await supabase
          .from(table)
          .update({ favorites })
          .eq('email', request.query.email)
        if (error) console.log(error)

        response.status(200).json({ data })
        break

      case 'trending':
        var tableTr = process.env.NODE_ENV.startsWith('dev')
          ? 'trending.dev'
          : 'trending.dev'

        var { data, error } = (await supabase.from(tableTr)
          .select('id, created_at, related_id, author ( first_name, last_name, avatar_url, cover_url, city, country, website, birthday, user_name, description ), content, num_like, num_impr, num_ans'))
        if (error) console.log(error)
        var dataBasic = data

        var shares = data.filter((rec) => rec.share_id !== null).map((rec) => rec.share_id)
        var { data, error } = await supabase.from(tableTr)
          .select('id, created_at, related_id, share_id, author ( first_name, last_name, email, avatar_url, cover_url, city, country, website, birthday, user_name, description ), content, num_like, num_impr, num_ans')
          .in('id', shares ?? [])

        response.status(200).json({ data: dataBasic, originals: data })
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
          .select('id, created_at, related_id, author ( first_name, last_name, email, avatar_url, cover_url, city, country, website, birthday, user_name, description ), content, num_like, num_impr')
          .eq('related_id', request.query.id))
        if (error) console.log(error)

        response.status(200).json({ data })
        break

      case 'display':

        var tableRel = process.env.NODE_ENV.startsWith('dev')
          ? 'relationships.dev'
          : 'relationships.dev'

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

        var tableTr = process.env.NODE_ENV.startsWith('dev')
          ? 'trending.dev'
          : 'trending.dev'

        // const date = new Date(request.query.date)
        // console.log(date);
        // const dateString = date.toISOString().split('T').shift()
        // const date1 = new Date(dateString);
        // const date2 = new Date(dateString);
        // // date1.setDate(date1.getDate() - 1)
        // date2.setDate(date2.getDate() + 1)
        // const dateString1 = date1.toISOString().split('T').shift()
        // const dateString2 = date2.toISOString().split('T').shift()

        var { data, error } = await supabase.from(tableTr)
          .select('id, created_at, share_id, author ( first_name, last_name, email, avatar_url, cover_url, city, country, website, birthday, user_name, description ), content, num_like, num_impr, num_ans')
          // .lt('created_at', dateString2)
          // .gt('created_at', dateString1)
          .in('author', emails).is('related_id', null).order('created_at', { ascending: false })
        if (error) console.log(error)
        var dataBasic = data

        var shares = data.filter((rec) => rec.share_id !== null).map((rec) => rec.share_id)
        var { data, error } = await supabase.from(tableTr)
          .select('id, created_at, related_id, share_id, author ( first_name, last_name, email, avatar_url, cover_url, city, country, website, birthday, user_name, description ), content, num_like, num_impr, num_ans')
          .in('id', shares ?? [])

        // console.log(data.slice(0, 10))

        // var data2 = await Promise.all(data.map(async (item) => {
        //   var { data, error } = await supabase.from(table).select('id').eq('related_id', item.id)
        //   if (error) console.log(error)
        //   console.log(">>>", { id: item.id, data });
        //   return { ...item, num_ans: data?.length ?? 0 }
        // }))

        response.status(200).json({ data: dataBasic, originals: data })
        break
    }

  } catch (error) {
    console.log(error);
    response.status(400).json({ message: 'Failed to manipulate messages.' })
  }
}
