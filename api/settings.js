import { createClient } from '@supabase/supabase-js'
import formidable from 'formidable'
import fs from 'fs'

async function handler(req, res) {
  const form = new formidable.IncomingForm()
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  )

  const storageName = process.env.NODE_ENV.startsWith('dev')
    ? 'users.dev'
    : 'users.dev'

  // const uploadFile = async (files, err) => {
  //   let cols = {}

  //   return cols
  // }

  const insertRecord = async () => {
    // eslint-disable-next-line
    return new Promise((resolve, reject) => {
      form.parse(req, async function (err, fields, files) {
        var cols = {}

        for (const [key, value] of Object.entries(files)) {
          if (files[key]) {
            let filepath = `${key}/${files[key].newFilename}.${files[key].mimetype.split('/').pop()}`
            // filepath = filepath.replace(/\s/g, '-') // IN CASE YOU NEED TO REPLACE SPACE OF THE IMAGE NAME
            const rawData = fs.readFileSync(files[key].filepath)
            const { data, error } = await supabase.storage
              .from(storageName)
              .upload(filepath, rawData, {
                contentType: files[key].mimetype,
              })

            if (error || err) {
              console.error(error || err);
              return reject({ success: false })
            }

            const field = key + '_url'
            cols[field] = `https://jdlejcgjpmmdtfhqomgy.supabase.co/storage/v1/object/public/${storageName}/${filepath}`
            // <img src="[supabase_url]/storage/v1/object/public/[bucket name]/[path to your image]" />
          }
        }

        // console.log(cols);

        // YOU DO NOT NEED BELOW UNLESS YOU WANT TO SAVE PUBLIC URL OF THE IMAGE TO THE DATABASE
        for (const [key, value] of Object.entries(fields)) {
          if (key !== 'path' || key !== 'email')
            cols[key] = value
        }

        await supabase.from(storageName).update(cols).eq('email', fields.email)
        resolve({ success: true })
      })
    })
  }

  try {
    await insertRecord()
    res.status(200).send({ success: true })
  } catch (err) {
    res.status(400).send({ success: false })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default handler
