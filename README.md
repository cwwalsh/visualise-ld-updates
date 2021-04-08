# visualise-ld-updates

The following instructions assume a Debian-based machine.

## Project setup

```
npm install
```

### Set up Fuseki Triplestore

NodeJS and the Jena TDB command line tools are required for this step:
https://jena.apache.org/documentation/tdb/commands.html

In `./db`, run

```
mkdir data
tdb2.tdbloader --loc=./data ../current/0.nt
```

Then move the `data` folder into `./db/jena-fuseki-docker-3.17.0/databases/`.

## Run development environment

```
npm run start
```

This will run a nodemon auto-restart instance on changes.

## Docker Development Instance

```
docker-compose -f docker-compose.dev.yml up -d
```

Will build a docker dev instance with all dependencies.

### Sample Fuseki Data

Once the Docker instance is running, run `node ./db/insertData.js` to add sample data to the triplestore.
