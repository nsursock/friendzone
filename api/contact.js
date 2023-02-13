import { createClient } from '@supabase/supabase-js'
const Cryptr = require('cryptr');

export default async function handler(request, response) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  )
  const storageName = process.env.NODE_ENV.startsWith('dev')
    ? 'users.dev'
    : 'users.dev'

  try {
    switch (request.query.mode) {

      case 'update':
        var table = process.env.NODE_ENV.startsWith('dev')
          ? 'messages2.dev'
          : 'messages2.dev'

        var { data, error } = await supabase.from(table).update({ unread: false }).eq('id', request.query.id).select('*')
        if (error) throw new Error(error)

        response.status(200).json({ success: true })
        break

      case 'conversation':
        var table = process.env.NODE_ENV.startsWith('dev')
          ? 'messages2.dev'
          : 'messages2.dev'

        const emails = [request.query.receiver, request.query.sender]

        var { data, error } = (await supabase.from(table)
          .select(`id, created_at, content, receiver, sender (id, first_name, last_name, user_name, avatar_url, cover_url, title, city, email, phone_number, country, birthday, description)`)
          .in('receiver', emails).in('sender', emails).order('created_at', { ascending: false }))
        if (error) throw new Error(error)

        response.status(200).json({ data })
        break

      case 'unread':
        var table = process.env.NODE_ENV.startsWith('dev')
          ? 'messages2.dev'
          : 'messages2.dev'

        var { data, error } = (await supabase.from(table)
          .select(`sender (id, first_name, last_name, user_name, avatar_url, cover_url, title, city, email, phone_number, country, birthday, description)`)
          .eq('receiver', request.query.email).eq('unread', true))
        if (error) throw new Error(error)

        var data = [...new Map(data.map((item) => [item.sender["email"], item])).values()] // unique values

        data = data.map((o) => o = {
          ...o.sender,
          full_name: o.sender.last_name + ' ' + o.sender.first_name
        })

        response.status(200).json({ data })
        break

      case 'send':
        var table = process.env.NODE_ENV.startsWith('dev')
          ? 'messages2.dev'
          : 'messages2.dev'

        const { sender, receiver, content, unread } = request.body

        let object = { sender, receiver, content, unread }
        var { data, error } = await supabase.from(table).insert(object).select('*')

        if (error) throw new Error(error)
        response.status(200).json({ success: true })
        break

      case 'receiver_keys':
        var { data, error } = (await supabase.from(storageName).select('password, public_key, private_key').eq('email', request.query.email))
        if (error) console.error(error)

        if (!data[0].public_key || !data[0].private_key)
          throw new Error('No keys found yet. Ask user to login.')

        var cryptr = new Cryptr(data[0].password, { pbkdf2Iterations: 10000, saltLength: 10 })

        var data = { publicKey: cryptr.decrypt(data[0].public_key), privateKey: cryptr.decrypt(data[0].private_key) }
        response.status(200).send({ data })
        break

      case 'sender_keys':
        const { publicKey, privateKey } = request.body
        var { data, error } = (await supabase.from(storageName).select('password, public_key, private_key').eq('email', request.query.email))
        if (error) console.error(error)

        var cryptr = new Cryptr(data[0].password, { pbkdf2Iterations: 10000, saltLength: 10 })

        // if first time sending message, encrypt keys and store them in database
        if (!data[0].public_key || !data[0].private_key) {
          var { error } = await supabase.from(storageName).update({
            'public_key': cryptr.encrypt(publicKey), 'private_key': cryptr.encrypt(privateKey)
          }).eq('email', request.query.email)
          if (error) console.error(error)

          data = { publicKey, privateKey }
        }
        // else send decrypted keys to client
        else {
          data = { publicKey: cryptr.decrypt(data[0].public_key), privateKey: cryptr.decrypt(data[0].private_key) }
        }

        response.status(200).send({ data })
        break
    }

  } catch (error) {
    console.log(error)
    response
      .status(400)
      .send({ success: false, error: 'Sorry, an error occurred' })
  }
}
