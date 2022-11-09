<div align="center">
	<p>
		<a href="https://cuttle.cards" title="Cuttle Website">
			<img src="./client/js/img/logo.png" width="300" style="max-width:300px;height:auto;" />
		</a>
	</p>
	<p>
		<a href="https://cuttle.cards" title="Cuttle Website">Website</a> | <a href="https://cuttle-cards.github.io/cuttle/" title="Cuttle Design Guide">Design Guide</a> | <a href="#community" title="Cuttle Community">Community</a>
	</p>
</div>

# Cuttle

This repository is the full-stack web app for [Cuttle](https://www.cuttle.cards), the pvp card game. The client (front-end) is a Single Page Application (SPA) built in [VueJs](https://vuejs.org/v2/guide/) using [Vuetify](https://vuetifyjs.com/en/getting-started/installation/). The server (back-end) that maintains the API is a [Node.js](https://nodejs.org/en/) application build with [Sails.Js](https://sailsjs.com/get-started). The application is tested end-to-end using [Cypress](https://docs.cypress.io/).

To play the game you will need to boot both the front & back end servers, then navigate to `localhost:8080` in your browser of choice.

## How To Play

Learn how to play the game by reading the [Game Rules](./docs/GAME_RULES.md).

## Contributing to our Project

Please see our [Contribution Guide](./docs/CONTRIBUTING.md) on how you can get started.

## Project setup and development

### Download nodeJs

[nodeJs](https://nodejs.org/en/) lets you create & run web servers in javascript (along with other fancy system-level stuff not needed for this project). Both the client and server depend on node as the main system-wide dependency. The download comes with npm (node package manager) which you'll use to install the project-specific dependencies.

**Currently version 16.xx.xx of node is required** as this is the latest version compatible with this project. You can [download node 16 here](https://nodejs.org/en/blog/release/v16.16.0/) or use [nvm](https://github.com/nvm-sh/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows) to manage multiple node versions (recommended for longer term nodejs development).

**NOTE** When running on your local computer, signup/login only stores credentials on your computer and in memory. Shutting down the server wipes the in-memory database along with all game & account data.

### Setup

#### Download the Code

##### Using git

```
git clone https://github.com/cuttle-cards/cuttle
```

##### Or [Download](https://github.com/cuttle-cards/cuttle/archive/refs/heads/main.zip) as .zip

#### Install Dependencies

Open your shell/terminal of choice, `cd` into the root folder of this repo and run

```
npm ci
```

**NOTE** `ci` (as opposed to `install`) is a 'clean install' which ensures versions exactly match package-lock.json).

#### Start the App

You can simultaneously run the server on `localhost:1337` and the client on `localhost:8080` with one command:

```
npm run start:dev
```

This will also automatically open up [Vue Devtools]. Alternatively, you can run them independantly with separate commands.

##### Start the Server (sails backend)

```
npm run start:server
```

##### Start the Client (Vue SPA)

Open another shell/terminal in the root folder of this repo and run

```
npm run start:client
```

to start the client on localhost:8080

#### Open in browser

Navigate to [localhost:8080](http:localhost:8080) in your browser of choice.

#### Shutting down

You can shut down the servers by hitting `ctrl + c` several times from the terminal windows they are running in. Shut down both servers to completely delete all game & account data.

### Development

#### Vue Devtools

To utilize [Vue Devtools](https://devtools.vuejs.org/), you can run

```
npm run start:devtools
```

Only dev builds include the Vue Devtools via `ENABLE_VUE_DEVTOOLS=true`. The two scripts that currently support Vue Devtool usage are `npm run start:dev` and `npm run e2e:gui`.

#### Build for production

From the root directory of the repo, you can run

```
npm run prod
```

to compile the Vue SPA into the `assets` directory, which will be statically served by the server (sails backend) at the same port on which it is running to support the API. You can now shut down the client and view the applicaion as its built for production at localhost:1337 (default port for sails).

If you just want to generate the production build, you can run

```
npm run build
```

#### Run the tests

While the application is running, (server + client) you can run

```
npm run e2e:client
```

to run the entire suite of end-to-end cypress tests against the client running at localhost:8080. This will execute the tests headlessly and output the results in your terminal.

You can also use

```
npm run e2e:gui
```

to open the cypress UI, which is useful for executing a single test file if you are for example developing a new feature or a fix and want to focus on that aspect of the application (and see how it performs). This is very helpful for localhost development.

Lastly, you can run

```
npm run e2e:server
```

to execute the entire test suite headlessly against localhost:1337, which you can use to test the last-built version of the application. This is effectively what is done in CI when a pull request is submitted agains the `main` branch of this repository.

**NOTE** you should run `npm run build` (see above) before this command so that the server (backend) serves the most up-to-date version of the client.

#### Linting (Formatting)

Format the project with

```
npm run lint:fix
```

and use

```
npm run lint
```

to check the formatting without autofixing problems. (This is what's run in CI when a PR is opened against the `main` branch).

#### Storybook (UX Documentation)

Run Storybook locally with

```
npm run storybook
```

It will start automatically on localhost:6006 and open a new tab in your browser.

#### Our contributors :star_struck:

<a href="https://github.com/cuttle-cards/cuttle/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=cuttle-cards/cuttle" />
</a>

<!-- Made with [contrib.rocks](https://contrib.rocks). -->

## Community

We have a very active Discord community and currently run 2 events per week.

- Wednesday Night Cuttle at 8:30pm EST
- Thursday Lunch Cuttle at 12:00pm EST

[![Discord Community](https://discord.com/api/guilds/833694928684187669/widget.png?style=banner2)](https://discord.gg/9vrAZ8xGyh)
