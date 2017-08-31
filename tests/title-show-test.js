/* global describe, beforeEach */
import { expect } from 'chai';
import it from './it-will';

import { describeApplication } from './helpers';
import TitleShowPage from './pages/title-show';

describeApplication('TitleShow', function() {
  let title, customerResources;

  beforeEach(function() {
    title = this.server.create('title', 'withPackages', {
      titleName: 'Cool Title',
      publisherName: 'Cool Publisher'
    });

    title.subjects = [
      this.server.create('subject', { subject: 'Cool Subject 1' }),
      this.server.create('subject', { subject: 'Cool Subject 2' }),
      this.server.create('subject', { subject: 'Cool Subject 3' })
    ];
    title.save();

    customerResources = title.customerResources.models;
  });

  describe("visiting the title page", function() {
    beforeEach(function() {
      return this.visit(`/eholdings/titles/${title.id}`, () => {
        expect(TitleShowPage.$root).to.exist;
      });
    });

    it('displays the title name', function() {
      expect(TitleShowPage.titleName).to.equal('Cool Title');
    });

    it('displays the publisher name', function() {
      expect(TitleShowPage.publisherName).to.equal('Cool Publisher');
    });

    it('displays the publisher type', function() {
      expect(TitleShowPage.publisherType).to.equal(title.pubType);
    });

    it('displays the subjects list', function() {
      expect(TitleShowPage.subjectsList).to.equal('Cool Subject 1; Cool Subject 2; Cool Subject 3');
    });

    it('displays a list of customer resources', function() {
      expect(TitleShowPage.packageList).to.have.lengthOf(customerResources.length);
    });

    it('displays name of a package in the customer resource list', function() {
      expect(TitleShowPage.packageList[0].name).to.equal(customerResources[0].package.packageName);
    });

    it('displays whether the first customer resource is selected', function() {
      expect(TitleShowPage.packageList[0].isSelected).to.equal(customerResources[0].isSelected);
    });
  });

  describe.skip("encountering a server error", function() {
    beforeEach(function() {
      this.server.get('/titles/:titleId', [{
        message: 'There was an error',
        code: "1000",
        subcode: 0
      }], 500);

      return this.visit(`/eholdings/titles/${title.titleId}`, () => {
        expect(TitleShowPage.$root).to.exist;
      });
    });

    it("dies with dignity", function() {
      expect(TitleShowPage.hasErrors).to.be.true;
    });
  });
});