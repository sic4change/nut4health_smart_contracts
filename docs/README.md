# Documentation generation

This documentation is published [here](https://static.cybersec.digital.tecnalia.dev/public/docs/nut4health/index.html).

Documentation should be automatically built and deployed to [MinIO](https://docs.min.io/) by our [Gitlab-ci](https://docs.gitlab.com/ee/ci/) pipeline.

In any case, manual generation and deployment is documented in this page.

## Serving documentation

```bash
docker-compose up
```

**NOTE**: It has hot reloading enabled, so there is no need to execute it.

## Building documentation

To build documentation files use:

```bash
# Documentation container must be running
docker-compose exec nut4health-docs sh -c "mkdocs build"
```

## Publishing documentation in Minio

First, make sure that the [MinIO client](https://docs.min.io/docs/minio-client-quickstart-guide.html) is installed.

Make sure that an endpoint called _minio_ is configured in your machine (only needed once):

```bash
mc alias set minio http://172.26.40.52:9000 [USER-ID] [PASSWD] --api S3v4
```

Finally, generate the static files following the process described in the _build_ section and execute:

```bash
mc rm -r --force minio/public/docs/nut4health/
mc cp -r site/ minio/public/docs/nut4health/
```
