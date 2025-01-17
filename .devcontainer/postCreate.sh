#!/bin/bash -i

# Install node using nvm, with the version specified in .nvmrc
nvm install

# Install node modules if they are not already installed
if [ ! -d node_modules ]; then
  npm ci
fi
