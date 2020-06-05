#!/usr/bin/env bash

ROOT="$(dirname ${0})/../../.."
ROOT="$(realpath "${ROOT}")"
yarn --cwd ${ROOT} precommit
