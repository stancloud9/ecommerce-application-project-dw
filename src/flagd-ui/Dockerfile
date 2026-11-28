# Copyright The OpenTelemetry Authors
# SPDX-License-Identifier: Apache-2.0

# Find eligible builder and runner images on Docker Hub. We use Ubuntu/Debian
# instead of Alpine to avoid DNS resolution issues in production.
#
# https://hub.docker.com/r/hexpm/elixir/tags?name=ubuntu
# https://hub.docker.com/_/ubuntu/tags
#
# This file is based on these images:
#
#   - https://hub.docker.com/r/hexpm/elixir/tags - for the build image
#   - https://hub.docker.com/_/debian/tags?name=bookworm-20250610-slim - for the release image
#   - https://pkgs.org/ - for packages
#   - Ex: docker.io/hexpm/elixir:1.20.1-erlang-28.5-debian-trixie-20260610-slim

FROM docker.io/hexpm/elixir:1.20.1-erlang-28.5-debian-trixie-20260610-slim@sha256:d80ab56d5f111c4285f20ea22ade8deafd00968f37722e7c8515070dfe86f98a AS base

# Install build dependencies
RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential git \
  && rm -rf /var/lib/apt/lists/*

# Prepare build directory
WORKDIR /app

# Install Hex + Rebar
RUN mix local.hex --force \
  && mix local.rebar --force

FROM base AS test

ENV MIX_ENV="test"

COPY ./src/flagd-ui/mix.exs ./src/flagd-ui/mix.lock ./
RUN mix deps.get --only $MIX_ENV

COPY ./src/flagd/demo.flagd.json ../flagd/demo.flagd.json
COPY ./src/flagd-ui/config config
COPY ./src/flagd-ui/priv priv
COPY ./src/flagd-ui/lib lib
COPY ./src/flagd-ui/test test

RUN mix test \
  && touch /tmp/flagd-ui-tests-passed

FROM base AS builder

ENV MIX_ENV="prod"

# Require tests to pass before building the release.
COPY --from=test /tmp/flagd-ui-tests-passed /tmp/flagd-ui-tests-passed

# Install Mix dependencies
COPY ./src/flagd-ui/mix.exs ./src/flagd-ui/mix.lock ./
RUN mix deps.get --only $MIX_ENV
RUN mkdir config

# Copy compile-time configuration
COPY ./src/flagd-ui/config/config.exs ./src/flagd-ui/config/${MIX_ENV}.exs ./src/flagd-ui/config/runtime.exs config/
RUN mix deps.compile

# Use the pre-downloaded Tailwind Linux executable
COPY ./tailwindcss-linux-x64 /app/_build/tailwind-linux-x64-4.0.9
RUN chmod +x /app/_build/tailwind-linux-x64-4.0.9 \
  && mix assets.setup

COPY ./src/flagd-ui/priv priv
COPY ./src/flagd-ui/lib lib
COPY ./src/flagd-ui/assets assets

# Compile and minify assets
RUN mix assets.deploy

# Compile the release
RUN mix compile

COPY ./src/flagd-ui/rel rel
RUN mix release

# Final runtime image
FROM docker.io/debian:trixie-20260824-slim@sha256:d7e12182ce18b85b93007c1dedf31f2d29e01ccf3182cc4017c709b6259bc132 AS final

RUN apt-get update \
  && apt-get install -y --no-install-recommends libstdc++6 openssl locales ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Set locale
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen \
  && locale-gen

ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8

WORKDIR "/app"
RUN chown nobody /app

ENV MIX_ENV="prod"

# Copy the final release
COPY --from=builder --chown=nobody:root /app/_build/${MIX_ENV}/rel/flagd_ui ./

ARG FLAGD_UI_PORT=4000
EXPOSE ${FLAGD_UI_PORT}

CMD ["sh", "-c", "ulimit -n 65536 && exec /app/bin/server"]
