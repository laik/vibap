#!/usr/bin/env sh
set -eu

envsubst '${API_HOST} ${API_PORT} ${NEXTJS_SERVER}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/nginx.conf

exec "$@"
