import { test } from '@playwright/test'

// import { TIMEZONE_COOKIE_NAME } from '../../../../../utils/constants'
// import {
//   COOKIE_CONTROL_DEFAULT,
//   TIMEZONE_DEFAULT,
// } from '../../../utils/constants'

test.describe('dashboard dev page', () => {
  // TODO: mock data
  // beforeEach(() => {
  //   cy.setCookie(TIMEZONE_COOKIE_NAME, TIMEZONE_DEFAULT)
  //   cy.setCookie('ncc_c', COOKIE_CONTROL_DEFAULT)
  // })
  //
  // context('visual regression', () => {
  //   it('looks as before', () => {
  //     cy.visit('/dashboard/dev')
  //     cy.get('[data-is-loading="false"]').should('be.visible')
  //     cy.get('[data-testid="nuxt-cookie-control-control-button"]').should(
  //       'be.visible'
  //     )
  //     cy.compareSnapshot('index')
  //   })
  // })
})
