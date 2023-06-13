# Smart-contract

## Set up

Before running any of the following commands, install dependencies:

```console
npm install
```

## Build

```bashrc
npm run compile
```

## Tests

To run the unit testing, execute:

```bashrc
npm test
```

## Deploy

Create a _.env_ file with the **DEPLOYER_KEY** defined to use the _tecnalia_ network.

```bashrc
npm run deploy tecnalia
```

## Documentation

The documentation is automatically published [here](https://static.cybersec.digital.tecnalia.dev/public/docs/nut4health/index.html).
It is generated using [solidity-docgen](https://github.com/OpenZeppelin/solidity-docgen) and [mkdocs](https://www.mkdocs.org/).

The following command generates documentation in:

- ./docs/build/md as Markdown files
- ./docs/build/site as HTML static files

```bashrc
npm run docs
```
# nut4health_smart_contracts
