// import { createClient } from '@supabase/supabase-js'
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()
const { faker } = require('@faker-js/faker');


(async () => {
  try {

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    )

    var table = 'relationships.dev'
    const email = 'nicolas.sursock@gmail.com'
    const statuses = ['Accepted']

    var data1 = (await supabase.from(table)
      .select(`user1 (id, first_name, last_name, avatar_url, cover_url, title, city, email, phone_number, country, birthday, description)`)
      .eq('user2', email).in('status', statuses)).data
    data1 = JSON.parse(JSON.stringify(data1).split('"user1":').join('"friend":'))
    console.log(data1);

    var data2 = (await supabase.from(table)
      .select(`user2 (id, first_name, last_name, avatar_url, cover_url, title, city, email, phone_number, country, birthday, description)`)
      .eq('user1', email).in('status', statuses)).data
    data2 = JSON.parse(JSON.stringify(data2).split('"user2":').join('"friend":'))
    console.log(data2);

    var data = data1.concat(data2)

    var table = 'messages.dev'

    var emails = data.map(d => d.friend.email)
    var ids = (await supabase.from('messages.dev').select('id').in('author', emails)).data.map((item) => item.id).sort(() => 0.5 - Math.random())
    // .not("related_id", "is", null))
      

    // var emails = (await supabase.from('users.dev').select('email')).data.map((item) => item.email).sort(() => 0.5 - Math.random())
    // var ids = (await supabase.from('messages.dev').select('id').not("related_id", "is", null)).data.map((item) => item.id).sort(() => 0.5 - Math.random())

    const num = 1000
    // var ids = [7979, 8024]
    for (let index = 0; index < num; index++) {

      var { data, error } = await supabase.from(table).insert({
        related_id: null, //ids[index % ids.length],
        created_at: faker.date.recent(3),
        author: emails[index % emails.length],
        content: faker.lorem.text(),
        num_like: Math.round(Math.random() * 10),
        num_impr: Math.round(Math.random() * 100)
      }).select('*')

      console.log({
        index, data
      });
    }


  } catch (error) {
    console.log(error)
  }
})();