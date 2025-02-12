import * as Sentry from '@sentry/node'
import { ProfilingIntegration } from '@sentry/profiling-node'
import { consola } from 'consola'

export default defineNitroPlugin((nitroApp) => {
  const runtimeConfig = useRuntimeConfig()
  const sentryConfig = getSentryConfig({
    environment: runtimeConfig.public.vio.environment,
    host: runtimeConfig.public.sentry.host,
    isInProduction: runtimeConfig.public.vio.isInProduction,
    projectId: runtimeConfig.public.sentry.project.server.id,
    projectPublicKey: runtimeConfig.public.sentry.project.server.publicKey,
    release: runtimeConfig.public.vio.releaseName,
    isTesting: isTestingServer(),
  })

  if (!sentryConfig.dsn) {
    consola.warn(
      'Sentry configuration is incomplete, skipping Sentry initialization.',
    )
    return
  }

  Sentry.init({
    ...sentryConfig,
    integrations: [new ProfilingIntegration()],
    profilesSampleRate: 1.0, // profiling sample rate is relative to traces sample rate
  })

  nitroApp.hooks.hook('error', (error) => {
    // if (error instanceof H3Error) {
    //   if (error.statusCode === 404) {
    //     return
    //   }
    // }

    Sentry.captureException(error)
  })

  nitroApp.hooks.hook('request', (event) => {
    event.context.$sentry = Sentry
  })

  nitroApp.hooks.hookOnce('close', async () => {
    await Sentry.close(2000)
  })
})
