import { FamilyTreeAppPage } from './app.po';

describe('family-tree-app App', function() {
  let page: FamilyTreeAppPage;

  beforeEach(() => {
    page = new FamilyTreeAppPage();
  });

  it('should display message saying home works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('home works!');
  });
});
