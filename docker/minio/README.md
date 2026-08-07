# MinIO local service

MinIO provides the S3-compatible local object-storage boundary required by StudioFlow.

`docker/minio/init-bucket.sh` creates the configured private bucket idempotently after MinIO becomes healthy. The API and Console are bound to loopback only.

The upstream MinIO container image can be overridden with `MINIO_IMAGE` in `.env` without changing application code.
