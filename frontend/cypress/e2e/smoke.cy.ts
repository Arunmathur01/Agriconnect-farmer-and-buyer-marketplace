describe('Agriconnect smoke', () => {
	it('visits home and goes to marketplace', () => {
		cy.visit('/');
		cy.contains('Marketplace');
		cy.contains('Marketplace').click();
		cy.url().should('include', '/market');
		cy.contains('Marketplace');
	});
});


