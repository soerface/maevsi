import fs from 'node:fs'

import { createError, getQuery, type H3Event, send, sendError } from 'h3'
import { consola } from 'consola'
import { jwtVerify, importSPKI } from 'jose'
import { ofetch } from 'ofetch'

import { JWT_ALGORITHM } from '~/utils/constants'

const configPostgraphileJwtPublicKeyPath =
  process.env.POSTGRAPHILE_JWT_PUBLIC_KEY_FILE || ''
const configPostgraphileJwtPublicKey = fs.existsSync(
  configPostgraphileJwtPublicKeyPath,
)
  ? fs.readFileSync(configPostgraphileJwtPublicKeyPath, 'utf-8')
  : undefined

export default defineEventHandler(async (event: H3Event) => {
  const {
    node: { req },
  } = event
  const uploadId = getQuery(event).uploadId

  consola.log('tusdDelete: ' + uploadId)

  if (!req.headers.authorization) {
    return sendError(
      event,
      createError({
        statusCode: 401,
        statusMessage: 'The request header "Authorization" is missing!',
      }),
    )
  }

  if (!configPostgraphileJwtPublicKey) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: 'The JSON web token public key is missing!',
      }),
    )
  }

  try {
    jwtVerify(
      req.headers.authorization.substring(7),
      await importSPKI(configPostgraphileJwtPublicKey, JWT_ALGORITHM),
      {
        algorithms: [JWT_ALGORITHM],
        audience: 'postgraphile',
        issuer: 'postgraphile',
      },
    )
  } catch (err: any) {
    return sendError(
      event,
      createError({
        statusCode: 401,
        statusMessage: `JSON web token verification failed: "${err.message}"!`,
      }),
    )
  }

  const queryResult = await pool
    .query('SELECT * FROM maevsi.upload WHERE id = $1;', [uploadId])
    .catch((err) => {
      sendError(
        event,
        createError({ statusCode: 500, statusMessage: err.message }),
      )
    })

  if (!queryResult) return

  if (!queryResult.rows.length) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: 'No result found for id "' + uploadId + '"!',
      }),
    )
  }

  const storageKey = (
    queryResult.rows[0] ? queryResult.rows[0].storage_key : undefined
  ) as string | undefined

  if (!storageKey) {
    return await deleteUpload(event, uploadId)
  }

  const response = await ofetch.raw('http://tusd:8080/files/' + storageKey, {
    headers: {
      'Tus-Resumable': '1.0.0',
    },
    ignoreResponseError: true, // handle response status below
    method: 'DELETE',
  })

  switch (response.status) {
    case 204:
      await deleteUpload(event, uploadId)
      event.node.res.statusCode = 204
      await send(event)
      break
    case 404:
      await deleteUpload(event, uploadId)
      break
    default:
      return sendError(
        event,
        createError({
          statusCode: 500,
          statusMessage: `Unexpected tusd status code: ${response.status}`,
        }),
      )
  }
})
