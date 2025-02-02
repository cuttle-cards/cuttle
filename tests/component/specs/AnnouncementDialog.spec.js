import AnnouncementDialog from '../../../src/routes/home/components/announcementDialog/AnnouncementDialog.vue';

const announcementData = {
  id: 'spades2024Announcement',
  activatorText: 'announcement.activatorText',
  title: 'announcement.title',
  displayCards: [],
  imgSrc: '../img/announcement/spades-2024-bracket.svg',
  startTime: null,
  endTime: null,
  announcementText: [
    {
      heading: 'announcement.heading',
      paragraph: [ 
        { text: 'announcement.paragraph' },
        { text: 'announcement.twitchLink', url: 'https://twitch.tv/cuttle_cards' }
      ],
    },
  ],
};


describe('AnnouncementDialog.spec.js', () => {

  it('Checks', () => {
    cy.mount(AnnouncementDialog, { props: { announcementData } });
    cy.get('[data-cy=announcement-dialog]').should('be.visible');
    cy.get('[data-cy=announcement-dialog-close]').click();
  });
});
