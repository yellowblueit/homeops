#!/bin/sh
# Replace environment variables in Kong config template
# (envsubst not available in Kong Alpine image, so use sed)
sed "s|\${ANON_KEY}|${ANON_KEY}|g; s|\${SERVICE_ROLE_KEY}|${SERVICE_ROLE_KEY}|g" \
  /home/kong/kong.yml.template > /home/kong/kong.yml
exec /docker-entrypoint.sh kong docker-start
