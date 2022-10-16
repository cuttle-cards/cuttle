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
- [How to Write GitHub Markdown](contributing/content-markup-reference.md).

## Getting started

### Issues

#### Create a new issue

If you spot a problem with the docs, [search if an issue already exists](https://docs.github.com/en/github/searching-for-information-on-github/searching-on-github/searching-issues-and-pull-requests#search-by-the-title-body-or-comments). If a related issue doesn't exist, you can open a new issue using a relevant [issue form](https://github.com/cuttle-cards/cuttle/issues/new/choose).

#### Solve an issue

Scan through our [existing issues](https://github.com/cuttle-cards/cuttle/issues) to find one that interests you. You can narrow down the search using `labels` as filters. See [Labels](/contributing/how-to-use-labels.md) for more information. As a general rule, we don’t assign issues to anyone. If you find an issue to work on, you are welcome to open a PR with a fix.

### Make Changes

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

   While booted in development mode (the default), you can make requests to `/test/loadSeasonFixture` and `/test/loadMatchFixtures` to seed records into those tables.

   The easiest way to do it is using test code. If you look at `tests/e2e/specs/out-of-game/stats.spec.js` you'll find the tests for the stats page, which are written using [cypress](https://docs.cypress.io). These tests already import fixture data from `tests/e2e/fixtures/statsFixtures.js` and use a custom cypress command to request those endpoints and seed that data into the database `beforeEach` test.

6. Create a working branch by `git checkout -b feature/[your feature or issue number]` or `git checkout -b bug/[your fix or issue number]` and start with your changes!

### Commit your update

Once your changes are ready, don't forget run the linter `npm run lint:fix` so the code is automatically formatted. Then you will need to run the test suites so that your changes are not breaking them. You may also create new tests or update any tests due to new behavioral changes.

To run the test suite, start by running the cmd `npm run start:server`. This will start the node server. Then you can run either `npm run e2e:client` or `npm run e2e:gui`. After all the tests has pass, you can self-review the changes yourself to speed up the review process:zap:.

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

Once your PR is merged, your contributions will be publicly visible on the [Cuttle Cards repository](https://github.com/cuttle-cards/cuttle).

You are now part of the Cuttle Cards community!
