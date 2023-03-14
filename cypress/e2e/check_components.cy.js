describe('checks components', () => {
  // it('displays dashboard', () => {
  //   cy.setCookie('APCSID', 'ucbpf5vh42kdo2u9ntf92as934')
  //   cy.visit('http://localhost:8030')
  // })

  /* ==== Test Created with Cypress Studio ==== */
  it('checks components', function() {
    /* ==== Generated with Cypress Studio ==== */
    cy.visit('http://localhost:8030');
    cy.get('[data-test="auth-login-form-email"]').clear('ad');
    cy.get('[data-test="auth-login-form-email"]').type('admin@web3ads.net');
    cy.get('[data-test="auth-login-form-password"]').clear();
    cy.get('[data-test="auth-login-form-password"]').type('aa@a.com{enter}');
    cy.get('[data-test="auth-login-form-submit-button"]').click();
    cy.get(':nth-child(2) > .MuiPaper-root > .MuiAccordionSummary-root > .MuiAccordionSummary-content').click();
    cy.get(':nth-child(2) > .MuiPaper-root > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > .MuiAccordion-region > .MuiAccordionDetails-root > .MuiList-root > :nth-child(1) > .MuiListItemText-root > .MuiTypography-root').click();
    cy.get(':nth-child(2) > .MuiPaper-root > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > .MuiAccordion-region > .MuiAccordionDetails-root > .MuiList-root > :nth-child(2) > .MuiListItemText-root > .MuiTypography-root').click();
    cy.get(':nth-child(3) > .MuiPaper-root > .MuiAccordionSummary-root > .MuiAccordionSummary-content > .MuiTypography-root').click();
    cy.get(':nth-child(3) > .MuiPaper-root > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > .MuiAccordion-region > .MuiAccordionDetails-root > .MuiList-root > .MuiListItemButton-root > .MuiListItemText-root > .MuiTypography-root').click();
    cy.get(':nth-child(4) > .MuiPaper-root > .MuiAccordionSummary-root > .MuiAccordionSummary-content > .MuiTypography-root').click();
    cy.get(':nth-child(4) > .MuiPaper-root > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > .MuiAccordion-region > .MuiAccordionDetails-root > .MuiList-root > :nth-child(1) > .MuiListItemText-root > .MuiTypography-root').click();
    cy.get(':nth-child(4) > .MuiPaper-root > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > .MuiAccordion-region > .MuiAccordionDetails-root > .MuiList-root > :nth-child(2) > .MuiListItemText-root > .MuiTypography-root').click();
    cy.get(':nth-child(5) > .MuiPaper-root > .MuiAccordionSummary-root > .MuiAccordionSummary-content > .MuiTypography-root').click();
    cy.get(':nth-child(5) > .MuiPaper-root > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > .MuiAccordion-region > .MuiAccordionDetails-root > .MuiList-root > :nth-child(1) > .MuiListItemText-root > .MuiTypography-root').click();
    cy.get(':nth-child(5) > .MuiPaper-root > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > .MuiAccordion-region > .MuiAccordionDetails-root > .MuiList-root > :nth-child(2) > .MuiListItemText-root > .MuiTypography-root').click();
    cy.get(':nth-child(6) > .MuiPaper-root > .MuiAccordionSummary-root').click();
    cy.get(':nth-child(6) > .MuiPaper-root > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > .MuiAccordion-region > .MuiAccordionDetails-root > .MuiList-root > :nth-child(1)').click();
    cy.get(':nth-child(6) > .MuiPaper-root > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > .MuiAccordion-region > .MuiAccordionDetails-root > .MuiList-root > :nth-child(2) > .MuiListItemText-root > .MuiTypography-root').click();
    cy.get(':nth-child(7) > .MuiPaper-root > .MuiAccordionSummary-root').click();
    cy.get(':nth-child(7) > .MuiPaper-root > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > .MuiAccordion-region > .MuiAccordionDetails-root > .MuiList-root > :nth-child(1) > .MuiListItemText-root > .MuiTypography-root').click();
    cy.get(':nth-child(7) > .MuiPaper-root > .MuiCollapse-root > .MuiCollapse-wrapper > .MuiCollapse-wrapperInner > .MuiAccordion-region > .MuiAccordionDetails-root > .MuiList-root > :nth-child(2) > .MuiListItemText-root > .MuiTypography-root').click();
    cy.get(':nth-child(4) > .MuiListItemText-root > .MuiTypography-root').click();
    cy.get(':nth-child(5) > .MuiListItemText-root > .MuiTypography-root').click();
    cy.get(':nth-child(8) > .MuiListItemButton-root > .MuiListItemText-root > .MuiTypography-root').click();
    cy.get(':nth-child(3) > .MuiListItemText-root > .MuiTypography-root').click();
    /* ==== End Cypress Studio ==== */
  });
})