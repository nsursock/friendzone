// import { createClient } from '@supabase/supabase-js'
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

function permute(arr) {
  let perm = []
  let len = arr.length
  for (let i = 0; i < len; i++) {
    for (let j = i + 1; j < len; j++) {
      perm.push({
        user1: arr[i], user2: arr[j]
      })
    }
  }
  return perm
}

async function ensureUnique(email, supabase) {
  var table = 'relationships.dev'

  var data1 = (await supabase.from(table)
    .select(`user1 (id, first_name, last_name, avatar_url, cover_url, title, city, email, phone_number, country, birthday, description)`)
    .eq('user2', email).eq('status', 'Accepted')).data
  data1 = JSON.parse(JSON.stringify(data1).split('"user1":').join('"friend":'))

  var data2 = (await supabase.from(table)
    .select(`user2 (id, first_name, last_name, avatar_url, cover_url, title, city, email, phone_number, country, birthday, description)`)
    .eq('user1', email).eq('status', 'Accepted')).data
  data2 = JSON.parse(JSON.stringify(data2).split('"user2":').join('"friend":'))

  var data = data1.concat(data2)

  const check = data.reduce((sums, entry) => {
    sums[entry.friend.email] = (sums[entry.friend.email] || 0) + 1;
    return sums;
  }, {})
  var arr = []
  for (const [key, value] of Object.entries(check)) {
    if (value > 1) {
      console.log(`${key}: ${value}`)
      arr.push(key)
    }
  }

  var { error } = await supabase
    .from(table)
    .delete()
    .in('user1', arr)
    .eq('user2', email)
  if (error) console.error(error)

  var { error } = await supabase
    .from(table)
    .delete()
    .in('user2', arr)
    .eq('user1', email)
  if (error) console.error(error)
}

(async () => {
  try {

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    )

    var tableRel = 'relationships.dev'
    var tableUser = 'users.dev'

    var data = (await supabase.from(tableUser).select('email')).data.map((item) => item.email)

    var perm = permute(data).filter((rel) => rel.user1.includes('sursock') || rel.user2.includes('sursock'))
    // console.table(perm)

    const num = 1000
    for (let index = 0; index < num; index++) {
      const el = perm[Math.floor(Math.random() * (perm.length))];

      var { data, error } = await supabase.from(tableRel).insert({
        user1: el.user1, user2: el.user2, status: 'Pending',
      }).select('*')

      await ensureUnique(el.user1, supabase)
      await ensureUnique(el.user2, supabase)

      console.log({
        index,
        user1: el.user1, user2: el.user2, status: 'Pending',
      });
    }


  } catch (error) {
    console.log(error)
  }
})();