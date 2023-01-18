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

(async () => {
  try {

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    )

    var tableRel = 'relationships.dev'
    var tableUser = 'users.dev'

    var data = (await supabase.from(tableUser).select('email')).data.map((item) => item.email)

    var perm = permute(data)
    // console.table(perm)

    const num = 1000
    for (let index = 0; index < num; index++) {
      const el = perm[Math.floor(Math.random() * (perm.length))];
      
      var { data, error } = await supabase.from(tableRel).insert({
        user1: el.user1, user2: el.user2, status: 'Accepted',
      }).select('*')

      console.log({ index,
        user1: el.user1, user2: el.user2, status: 'Accepted',
      });
    }
    

  } catch (error) {
    console.log(error)
  }
})();