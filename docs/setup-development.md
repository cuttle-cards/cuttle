## Project setup and development

### Download nodeJs

[nodeJs](https://nodejs.org/en/) lets you create & run web servers in javascript (along with other fancy system-level stuff not needed for this project). Both the client and server depend on node as the main system-wide dependency. The download comes with npm (node package manager) which you'll use to install the project-specific dependencies.

**Currently version 18.xx.xx of node is required** as this is the latest stable version of node. You can [download node here](https://nodejs.org/en/) or use [nvm](https://github.com/nvm-sh/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows) to manage multiple node versions (recommended for longer term nodejs development).

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

You can shut down the servers by hitting `ctrl + c` several times from the terminal windows they are running in. Shut down both servers to completely deletes all game & account data.

### Development

#### Build for production

From the root directory of the repo, you can run

```
npm run build
```

to compile the Vue SPA into the `assets` directory, which will be statically served by the server (sails backend) at the same port on which it is running to support the API. You can now shut down the client and view the applicaion as its built for production at localhost:1337 (default port for sails).

#### Preview build (on other devices)
You can build the frontend and boot the backend to serve the latest frontend preview from the sails server at port 1337 with

```
npm run start:preview
```

This will let you see what the production build will look like when served from the backend. This also lets you view the app on other devices connected to the same wifi network opening your browser to your-local-ip-address:1337.

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

to execute the entire test suite headlessly against localhost:1337, which you can use to test the last-built version of the application. This is effectively what is done in CI when a pull request is submitted against the `main` branch of this repository.

**NOTE** you should run `npm run build` (see above) before this command so that the server (backend) serves the most up-to-date version of the client.

#### Debugging Backend Server

You can utilize the node debugger in VSCode to debug the backend server.

To do so, start the backend server with:


```
npm run start:server
```

Then, hit cmd+shift+p or ctrl+shift+p, and then enter `Debug: Attach to node process` in the top window opened, to select the process you want to watch.

You will be able to utilize many standard debugging features, such as setting breakpoints by clicking line numbers, stepping in and over functions, and watching variables. For details, please refer to the [documentation](https://code.visualstudio.com/docs/editor/debugging).

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
