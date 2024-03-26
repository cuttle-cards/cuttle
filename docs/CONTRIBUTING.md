# Welcome to Cuttle Cards contributing guide <!-- omit in toc -->

Thank you for investing your time in contributing to our project! :sparkles:.

Read our [Code of Conduct](./CODE_OF_CONDUCT.md) to keep our community approachable and respectable.

In this guide you will get an overview of the contribution workflow from opening an issue, creating a PR, reviewing, and merging the PR.

## New contributor guide

To get an overview of the project, read the [README](../README.md). Here are some resources to help you get started with open source contributions:

- [Finding ways to contribute to open source on GitHub](https://docs.github.com/en/get-started/exploring-projects-on-github/finding-ways-to-contribute-to-open-source-on-github)
- [Set up Git](https://docs.github.com/en/get-started/quickstart/set-up-git)
- [GitHub flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Collaborating with pull requests](https://docs.github.com/en/github/collaborating-with-pull-requests)
- [How to Write GitHub Markdown](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax).

## Getting started

### Issues

#### Create a new issue

If you spot a problem with the docs, [search if an issue already exists](https://docs.github.com/en/github/searching-for-information-on-github/searching-on-github/searching-issues-and-pull-requests#search-by-the-title-body-or-comments). If a related issue doesn't exist, you can open a new issue using a relevant [issue form](https://github.com/cuttle-cards/cuttle/issues/new/choose).

#### Solve an issue

Scan through our [existing issues](https://github.com/cuttle-cards/cuttle/issues) to find one that interests you. You can narrow down the search using `labels` as filters. See [Labels](/contributing/how-to-use-labels.md) for more information. As a general rule, we don’t assign issues to anyone. If you find an issue to work on, you are welcome to open a PR with a fix.

### (Automated) Version Management

This repo automatically increments the package version based on version labels that the core team applies to pull requests. **You do not need to update the `version` fields in package files** because it is handled automatically. Cuttle uses semantic versioning (semver), which uses version numbers like 4.3.22. The versioning scheme consists of major, minor, and patch versions.


* `patch-version`, the automation will increment the patch number in the version field (e.g., from 4.3.22 to 4.3.23)
* `minor-version`, the automation will reset the patch number to zero and increment the minor version (e.g., from 4.3.22 to 4.4.0).
* `major-version`, the automation will set both the patch and minor versions to zero and increment the major version (e.g., from 4.3.22 to 5.0.0).

### Test-Driven Development

We encourage contributors to practice Test Driven Development (TDD) when working on cuttle.cards, because it can save an enormous amount of time while increasing everyone's confidence that the application does what it's supposed to. By utilizing the existing testing infrastructure, you can quickly and automatically do things like:

1.  Sign-up two accounts and drop them into a game
2.  Load the game into a specific state i.e. putting the cards wherever you want
3.  Make arbitrary chains of moves on behalf of both players
4.  Assert the full state of the game (where the relevant cards are) and more.

The general idea behind Test Driven Development is to write/modify the tests before making changes to the application. This lets you clearly define what the application is supposed to do before changing things, so that you'll know with confidence when things work correctly. TDD takes practice, and it's not required to contribute, but we are happy to help you practice it and once you get going with testing, you'll see what an enormous Quality of Life improvement it can make to your developer experience.

#### Make changes directly on Github

Click the **PENCIL** icon top right of any docs page to make small changes such as a typo, sentence fix, or a broken link. This takes you a file editor where you can make your changes and [create a pull request](#pull-request) for a review.

#### Make changes locally

1. [Install Git LFS](https://docs.github.com/en/github/managing-large-files/versioning-large-files/installing-git-large-file-storage).

2. Fork the repository.

- Using the command line:
  - [Fork the repo](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo#fork-an-example-repository) so that you can make your changes without affecting the original project until you're ready to merge them.

3. Install or update to **[Node.js v16](https://nodejs.org/en/download/)**.

   At the root directory, use the cmd

   ```bash
   npm ci
   ```

4. Set up Cypress.io, our end-to-end testing framework, please follow the [installation guide](https://docs.cypress.io/guides/getting-started/installing-cypress#System-requirements) according to your operating system.

5. For seeding the database, here's a quick guide:

   **Recommended Way** - Please see [Test-Driven Development](#how-to-tdd-using-cypress)

   While booted in development mode (the default), you can make requests to `/api/test/loadSeasonFixture` and `/api/test/loadMatchFixtures` to seed records into those tables.

   To delete data from the database, you can make a request `/api/test/wipeDatabase` to your local server which will wipe all records.

6. Create a working branch by `git checkout -b feature/[your feature or issue number]` or `git checkout -b bug/[your fix or issue number]` and start with your changes!

7. It's best practice to checkout main (`git checkout main`), pull from the official repo’s main (`git pull https://github.com/cuttle-cards/cuttle.git main`), checkout your feature branch (`git checkout branchName`), and merge main back into your branch (`git merge main`) every time you start coding.

#### How To TDD Using Cypress

The easiest way to seed data is using test code. The existing in-game end-to-end tests (found in the `/tests/e2e/specs/in-game/*.spec.js` files) generally call the `cy.setupGameAsP0()` or `cy.setupGameAsP1()` are imported from `tests/e2e/support/helpers.js`. These test helpers will run inside the `beforeEach()` hooks that run before each test. This will automatically:

1.  Sign up and authenticate two accounts
2.  Create and join a game as both players
3.  Ready up to start that game
4.  Log success and continue to the next test commands once the game has loaded

This is much faster than setting up a game by hand, and it pairs very well with the custom cypress command `cy.loadGameFixture()` which allows you to programmatically load the game into a specific state by specifying where you would like specific cards to be place e.g.

```javascript
cy.loadGameFixture({
  p0Hand: [Card.ACE_OF_CLUBS, Card.ACE_OF_SPADES, Card.SEVEN_OF_CLUBS],
  p0Points: [Card.TWO_OF_CLUBS, Card.TEN_OF_HEARTS],
  p0FaceCards: [Card.KING_OF_SPADES],
  p1Hand: [Card.TEN_OF_CLUBS, Card.TEN_OF_SPADES],
  p1Points: [Card.SIX_OF_HEARTS, Card.ACE_OF_DIAMONDS],
  p1FaceCards: [Card.QUEEN_OF_HEARTS],
  topCard: Card.FIVE_OF_DIAMONDS,
  secondCard: Card.EIGHT_OF_SPADES,
  scrap: [Card.TWO_OF_HEARTS, Card.FOUR_OF_CLUBS],
});
```

You can then make moves on behalf of the player by clicking on various elements using `cy.get('<some-selector>').click()`. Various elements (like cards in different places) have data-\* selectors applied to them in the template. Check the templates of the component(s) you're testing to see the exact selectors, but as a general rule, cards are given attributes of the form: `data-<which-player>-<which-localtion>-card=<rank>_<suit>` (ranks start at 1 and suits start at 0) and move choices are given attributes of the form `data-move-choice=<move-name>`.

So in the above example you could scuttle p1's six of hearts using p0's seven of clubs (if you are p0) with:

```javascript
cy.get('[data-player-hand-card=7_0').click(); // Click the 7 of clubs in the player's hand
cy.get('[data-move-choice=scuttle]').click(); // Choose to scuttle
cy.get('[data-opponent-point-card=6_2]').click(); // Click opponent's 6 of hearts to select it for scuttling
```

You can then make moves on behalf of the opponent using custom cypress commands that will request any particular move e.g. `cy.drawCardOpponent();` or `cy.playPointsOpponent(Card.TEN_OF_CLUBS);`

Lastly, you can use the `assertGameState(playerNumber, fixtureObject)` helper to verify that the resulting game state matches the specified fixture same shape as the input to `loadGameFixture()`, after specifying the player number (0 for p0, 1 for p1) of the which player's perspective we are testing from.

For other tests, it may be valuable to seed the database directly with records from fixture data. If you look at `tests/e2e/specs/out-of-game/stats.spec.js` you'll find the tests for the stats page. These tests already import fixture data from `tests/e2e/fixtures/statsFixtures.js` and use a custom cypress command to request those endpoints and seed that data into the database `beforeEach` test.

### Commit your update

Once your changes are ready, don't forget run the linter `npm run lint:fix` so the code is automatically formatted. Then you will need to run the test suites so that your changes are not breaking them. You may also create new tests or update any tests due to new behavioral changes.

To run the test suite, start by running the cmd `npm run start:server`. This will start the node server. Then you can run either `npm run e2e:client` or `npm run e2e:gui`. After all the tests have passed, you can self-review the changes yourself to speed up the review process:zap:.

Now, commit the changes once you are happy with them.

### Pull Request

When you're finished with the changes, create a pull request, also known as a PR.

- Fill the "Ready for review" template so that we can review your PR. This template helps reviewers understand your changes as well as the purpose of your pull request.
- Don't forget to [link PR to issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue) if you are solving one.
- Enable the checkbox to [allow maintainer edits](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/allowing-changes-to-a-pull-request-branch-created-from-a-fork) so the branch can be updated for a merge.
  Once you submit your PR, a team member will review your proposal. We may ask questions or request for additional information.
- We may ask for changes to be made before a PR can be merged, either using [suggested changes](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/incorporating-feedback-in-your-pull-request) or pull request comments. You can apply suggested changes directly through the UI. You can make any other changes in your fork, then commit them to your branch.
- As you update your PR and apply changes, mark each conversation as [resolved](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/commenting-on-a-pull-request#resolving-conversations).
- If you run into any merge issues, checkout this [git tutorial](https://github.com/skills/resolve-merge-conflicts) to help you resolve merge conflicts and other issues.

### Your PR is merged!

Congratulations :tada::tada: The Cuttle Cards team thanks you :sparkles:.

Once your PR is merged, your contributions will be publicly visible on the [Cuttle Cards repository](https://github.com/cuttle-cards/cuttle) and automatically deployed to [www.cuttle.cards](https://www.cuttle.cards).

You are now a Cuttle Cards Contributor!
