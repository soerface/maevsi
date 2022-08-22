import {
  createClient,
  ssrExchange,
  dedupExchange,
  fetchExchange,
  ClientOptions,
} from '@urql/core'
import { cacheExchange } from '@urql/exchange-graphcache'
import { relayPagination } from '@urql/exchange-graphcache/extras'
import { devtoolsExchange } from '@urql/devtools'
import { provideClient } from '@urql/vue'
import consola from 'consola'
import { ref } from 'vue'

import { defineNuxtPlugin, useNuxtApp } from '#app'

import schema from '~/gql/introspection'
import { GraphCacheConfig } from '~/gql/schema'

import {
  authenticationAnonymous,
  jwtFromCookie,
  jwtRefresh,
} from '~/plugins/util/auth'
import { useMaevsiStore } from '~/store'

// const ssrKey = '__URQL_DATA__'

export default defineNuxtPlugin(async (nuxtApp) => {
  const ssr = ssrExchange({
    isClient: process.client,
  })

  // TODO: Enable when SSR hooks are available in Nuxt bridge or when migrated to Nuxt 3. (https://github.com/maevsi/maevsi/issues/283)
  // if (process.client) {
  //   nuxtApp.hook('app:created', () => {
  //     ssr.restoreData(nuxtApp.payload[ssrKey])
  //   })
  // }

  // if (process.server) {
  //   nuxtApp.hook('app:rendered', () => {
  //     nuxtApp.payload[ssrKey] = ssr.extractData()
  //   })
  // }

  const cacheConfig: GraphCacheConfig = {
    schema,
    resolvers: {
      Query: {
        allContacts: relayPagination(),
        allEvents: relayPagination(),
        allUploads: relayPagination(),
      },
    },
    // updates: {
    //   Mutation: {
    //     eventDelete(_parent, args, cache, _info) {
    //       cache.invalidate({
    //         __typename: 'Event',
    //         id: (args.input as Variables).id as string | number,
    //       })
    //     },
    //   },
    // },
  }

  const cache = cacheExchange(cacheConfig)

  const options: ClientOptions = {
    requestPolicy: 'network-only', // TODO: https://github.com/maevsi/maevsi/issues/720
    fetchOptions: () => {
      const store = useMaevsiStore(nuxtApp.nuxt2Context.$pinia)
      const jwt = store.jwt

      if (jwt) {
        consola.trace('GraphQL request authenticated with: ' + jwt)
        return {
          headers: { authorization: `Bearer ${jwt}` },
        }
      } else {
        consola.trace('GraphQL request without authentication.')
        return {}
      }
    },
    url: process.server
      ? 'http://postgraphile:5000/graphql'
      : 'https://postgraphile.' +
        (process.env.NUXT_ENV_STACK_DOMAIN || 'maevsi.test') +
        '/graphql',
    exchanges: [
      ...(process.env.NODE_ENV === 'production' ? [] : [devtoolsExchange]),
      dedupExchange,
      cache,
      ssr, // add `ssr` before `fetchExchange`
      fetchExchange,
    ],
  }
  const client = ref(createClient(options))

  function urqlReset() {
    client.value = createClient(options)
  }

  nuxtApp.hook('vue:setup', () => {
    const { $urql } = useNuxtApp()
    provideClient($urql)
  })

  // Either authenticate anonymously or refresh token on page load.
  if (process.server && nuxtApp.ssrContext) {
    const store = useMaevsiStore(nuxtApp.ssrContext.$pinia)
    const jwtData = jwtFromCookie(nuxtApp.ssrContext.req)

    if (jwtData?.jwtDecoded.id) {
      await jwtRefresh(
        client.value,
        urqlReset,
        store,
        nuxtApp.ssrContext.res,
        jwtData.jwtDecoded.id
      )
    } else {
      await authenticationAnonymous(
        client.value,
        urqlReset,
        store,
        nuxtApp.ssrContext.res
      )
    }
  }

  return {
    provide: {
      urql: client,
      urqlReset,
    },
  }
})

// declare module '#app' {
//   interface NuxtAppCompat {
//     $urql: Ref<Client>
//     urqlReset: () => undefined
//   }
// }
