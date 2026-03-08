#!/bin/sh
# Replace environment variables in Kong config template
envsubst '${ANON_KEY} ${SERVICE_ROLE_KEY}' < /home/kong/kong.yml.template > /home/kong/kong.yml
exec /docker-entrypoint.sh kong docker-start
