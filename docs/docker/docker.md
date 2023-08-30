# Docker

- [Local Development](#local-development)
- [Architecture](#architecture)
  - [Client Container](#client-container)
  - [Server Container](#server-container)
  - [Postgres Container](#postgres-container)
  - [Diagram](#diagram)


## Local Development

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Run `npm run docker:start`
3. Run `npm run start:devtools` in another tab
   - If you don't do this, you'll see port `8098` failures in the browser console when the devtools fail to connect
4. Go to http://localhost:8080 in your browser

You can connect to the db via `postgresql://cuttlesworth:p4ssw0rd!@database:5432/cuttle` locally, and query or manage migrations with a database administration tool like [DBeaver](https://dbeaver.io/).

## Architecture

### Client Container

- Runs Vue
  - Exposed via http://localhost:8080
- Runs Vite (and Vite Proxy)
  - Connects to Sails.js via http://server:1337

### Server Container

- Runs Sails.js
  - Exposed via http://localhost:1337
- Hostname of `server:1337`
- Connects to Postgres via port `5432`

### Postgres Container

- Runs Postgres
  - Exposed via http://localhost:5432

### Diagram

![Architectural Diagram](./architecture-diagram.png)

[Diagram](./architecture-diagram.drawio) can be edited on [draw.io](https://app.diagrams.net/).

