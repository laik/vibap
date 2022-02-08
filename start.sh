#!/bin/bash
set -o errexit
set -o nounset
set -o pipefail

REPO=
APP=vibap
COMMIT_ID=$(git rev-parse --verify HEAD)
VERSION="${VERSION:-"${COMMIT_ID:0:8}"}"

function build() {
  echo "Build"
  docker build -t ${REPO}/${APP}:${VERSION} --platform linux/amd64 -f Dockerfile .
  docker push ${REPO}/${APP}:${VERSION}
  echo "End....."
};

function build_nginx() {
  echo "Build"
  docker build -t "${REPO}/${APP}-nginx:${VERSION}" -f Dockerfile.nginx .
  docker push ${REPO}/${APP}-nginx:${VERSION}
  echo "End....."
}

function run(){
  echo "Running"
  docker rm -f vibap && \
	docker run --name vibap --restart=always -itd ${REPO}/${APP}:${VERSION}
  docker rm -f vibap-nginx && \
  docker run --name vibap-nginx --restart=always -itd \
    --link vibap:vibap \
    -e API_HOST=${CLOUD_URL} \
    -e SDN_API_HOST=${SDN_API_HOST} \
    -e DB_API_HOST=${DB_API_HOST} \
    -e API_PORT=8080    \
    -e NEXTJS_SERVER=vibap \
    -p 5000:80 \
    ${REPO}/${APP}-nginx:${VERSION}

  echo "End....."
}

while true
do
  case "$1" in
  build-nginx)
      build_nginx
      shift
      ;;
  build)
      build
      build_nginx
      shift
      ;;
  run)
      run
      shift
      ;;
  -h|--help)
      usage
      ;;
  esac
shift
done
