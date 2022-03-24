describe('Home page tests', () => {
  it('should display the content wrapper class', () => {
    cy.visit('/')
    cy.get('[data-testid="content-wrapper"]').should('be.visible')
  })
})
