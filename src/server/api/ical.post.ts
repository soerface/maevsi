import { createError, defineEventHandler, readBody, type H3Event } from 'h3'
import DOMPurify from 'isomorphic-dompurify'
import ical, { ICalCalendarMethod, ICalEventStatus } from 'ical-generator'
import mustache from 'mustache'

import { getTextFromHtml } from '~/utils/util'
import type {
  ContactItemFragment,
  EventItemFragment,
  InvitationItemFragment,
} from '~/gql/generated/graphql'
import { SITE_URL } from '~/utils/constants'

export default defineEventHandler(async (h3Event: H3Event) => {
  const body = await readBody(h3Event)

  const bodyChecks = [
    { property: undefined, name: 'Body' },
    { property: 'event', name: 'Event' },
  ]

  for (const bodyCheck of bodyChecks) {
    if (bodyCheck.property ? !body[bodyCheck.property] : !body)
      throw createError({
        statusCode: 400,
        statusMessage: `${bodyCheck.name} is not set!`,
      })
  }

  const contact = body.contact
  const event = body.event
  const eventAuthorUsername = body.event.accountByAuthorAccountId.username
  const invitation = body.invitation

  setResponseHeaders(h3Event, {
    'Content-Type': 'text/calendar',
    'Content-Disposition':
      'attachment; filename="' +
      eventAuthorUsername +
      '_' +
      event.slug +
      '.ics"',
  })
  return getIcalString({ contact, event, invitation, siteUrl: SITE_URL })
})

export const getIcalString = ({
  contact,
  event,
  invitation,
  siteUrl,
}: {
  contact?: ContactItemFragment
  event: Pick<
    EventItemFragment,
    | 'accountByAuthorAccountId'
    | 'description'
    | 'end'
    | 'id'
    | 'location'
    | 'name'
    | 'slug'
    | 'start'
  >
  invitation?: InvitationItemFragment
  siteUrl: string
}) => {
  const eventAuthorUsername = event.accountByAuthorAccountId?.username
  const userEventPath = `${eventAuthorUsername}/${event.slug}`
  const eventUrl = `${siteUrl}/events/${userEventPath}`
  const eventDescriptionHtml = mustache.render(
    event.description ? `${eventUrl}\n${event.description}` : '',
    {
      contact,
      event,
      invitation,
    },
  )
  const hostname = new URL(siteUrl).hostname

  return ical({
    // `prodId` is generated automatically.
    // name: userEventPath.replace('/', '_'),
    // url: eventUrl,
    // `scale` is specified as `GREGORIAN` if not set explicitly.
    // `timezone` shouldn't be needed as the database outputs UTC dates.
    method: ICalCalendarMethod.PUBLISH, // https://tools.ietf.org/html/rfc5546#section-3.2
    // `ttl` ... I don't think that's needed?
    events: [
      {
        id: event.id,
        // sequence: ,
        start: event.start, // Appointment date of beginning, required.
        ...(event.end && { end: event.end }),
        // `timezone` shouldn't be needed as the database outputs UTC dates.
        // timestamp: moment(), // Appointment date of creation (= now).
        // allDay: false,
        // floating: , // Mutually exclusive with `timezone`.
        // repeating: {
        //   freq: 'MONTHLY', // required
        //   count: 5,
        //   interval: 2,
        //   until: new Date('Jan 01 2014 00:00:00 UTC'),
        //   byDay: ['su', 'mo'], // repeat only sunday and monday
        //   byMonth: [1, 2], // repeat only in january und february,
        //   byMonthDay: [1, 15], // repeat only on the 1st and 15th
        //   bySetPos: 3, // repeat every 3rd sunday (will take the first element of the byDay array)
        //   exclude: [new Date('Dec 25 2013 00:00:00 UTC')], // exclude these dates
        //   excludeTimezone: 'Europe/Berlin' // timezone of exclude
        // },
        // recurrenceId: moment(),
        summary: event.name, // The event's title.
        ...(event.description && {
          description: {
            plain: getTextFromHtml(eventDescriptionHtml),
            html: DOMPurify.sanitize(eventDescriptionHtml),
          },
          // description: getTextFromHtml(DOMPurify.sanitize(eventDescriptionHtml)),
        }),
        ...(event.location && { location: event.location }),
        organizer: {
          name: eventAuthorUsername,
          email: eventAuthorUsername + '@' + hostname,
          // mailto: 'explicit@mailto.com'
        },
        // attendees: [{
        //   name: 'Me',
        //   email: 'm@e.ee',
        //   rsvp: true,
        //   role: 'req-participant',
        //   status: 'accepted',
        //   type: 'individual',
        //   delegatesTo: { email: 'to@bar.com', name: 'From' },
        //   delegatesFrom: { email: 'from@bar.com', name: 'Too' }
        // }],
        // alarms: [{
        //   type: 'display',
        //   triggerBefore: moment(),
        //   triggerAfter: moment(),
        //   repeat: 4,
        //   interval: 300,
        //   attach: 'https://example.com/notification.aud',
        //   description: 'Alarm!'
        // }],
        // categories: [{
        //   name: 'appointment'
        // }],
        url: eventUrl,
        status: ICalEventStatus.CONFIRMED,
        // status: 'CONFIRMED',
        // busystatus: 'busy',
        // created: moment(), // Event creation date.
        // lastModified: moment()
      },
    ],
  }).toString()
}
