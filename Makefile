PWD = $(shell pwd)
VERSION = $(shell cat package.json | grep "\"version\"" | sed -e 's/^.*: "\(.*\)".*/\1/')

DOCKER_COMPOSE = ./.docker/docker-compose.yml
DOCKERFILE_NODE = ./.docker/node/Dockerfile

TAG_PREFIX = docker.wouterdeschuyter.be/horecalijst/api
TAG_NODE = ${TAG_PREFIX}:node

all: build

clean:
	-rm -rf node_modules
	-rm -rf dist
	-rm -rf .env
	-rm -rf .build-*

node_modules: yarn.lock
	docker run --rm -v ${PWD}:/code -w /code node:14-slim yarn

lint: node_modules
	docker run --rm -v ${PWD}:/code -w /code node:14-slim yarn lint

.build-app: node_modules
	docker run --rm -v $(PWD):/code -w /code \
			-e APP_URL \
			-e API_URL \
			-e DATABASE_HOST \
			-e DATABASE_NAME \
			-e DATABASE_USER \
			-e DATABASE_PASS \
			-e JWT_SECRET \
			-e MAILJET_API_KEY \
			-e MAILJET_API_SECRET \
			-e MAIL_SENDER_NAME \
			-e MAIL_SENDER_EMAIL \
			-e MOLLIE_API_KEY \
			-e FREE_TRIAL_DAYS \
		node:14-slim yarn build
	touch .build-app

.build-node: .build-app ${DOCKERFILE_NODE}
	docker build -f ${DOCKERFILE_NODE} -t ${TAG_NODE} .
	touch .build-node

build: .build-node
	docker tag ${TAG_NODE} ${TAG_NODE}-${VERSION}

docker-login:
	docker login docker.wouterdeschuyter.be -u ${DOCKER_REGISTRY_USER} -p ${DOCKER_REGISTRY_PASS}

push: build docker-login
	docker push ${TAG_NODE}
	docker push ${TAG_NODE}-${VERSION}

deploy:
	ssh ${DEPLOY_USER}@${DEPLOY_HOST} "mkdir -p ${DEPLOY_PATH}"
	scp ${DOCKER_COMPOSE} ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/docker-compose.yml
	ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH}; docker-compose pull"
	ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH}; docker-compose up -d"
