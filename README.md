# @horecalijst/api

![release](https://github.com/horecalijst/api/workflows/release/badge.svg)
![linting](https://github.com/horecalijst/api/workflows/linting/badge.svg)

## Running

```bash
docker-compose -f .docker/docker-compose.dev.yml up
```

## Setup

```bash
cp .env.example .env
```

### VSCode

#### Plugins

- https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint

#### Workspace settings

```javascript
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
  },
  "eslint.validate": [
    "javascript", "typescript",
  ],
}
```
