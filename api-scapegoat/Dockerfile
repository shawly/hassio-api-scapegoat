ARG BUILD_FROM=hassioaddons/base:7.1.0
# hadolint ignore=DL3006
FROM ${BUILD_FROM}

# Copy root filesystem
COPY rootfs /

# Setup base
# hadolint ignore=DL3003
RUN \
    apk add --no-cache --virtual .build-dependencies \
        git=2.24.1-r0 \
        npm=12.15.0-r1 \
    \
    && apk add --no-cache \
        nginx=1.16.1-r6 \
        nodejs-current=13.1.0-r0 \
        openssl=1.1.1d-r3 \
    \
    && cd /opt/api-scapegoat \
    && npm install \
    \
    && apk del --purge .build-dependencies \
    && rm -fr /tmp/*

# Build arguments
ARG BUILD_ARCH
ARG BUILD_DATE
ARG BUILD_REF
ARG BUILD_VERSION

# Labels
LABEL \
    io.hass.name="API Scapegoat" \
    io.hass.description="API Scapegoat add-on by shawly" \
    io.hass.arch="${BUILD_ARCH}" \
    io.hass.type="addon" \
    io.hass.version=${BUILD_VERSION} \
    maintainer="shawly <shawly@users.noreply.github.com>" \
    org.label-schema.description="API Scapegoat add-on by shawly" \
    org.label-schema.build-date=${BUILD_DATE} \
    org.label-schema.name="API Scapegoat" \
    org.label-schema.schema-version="1.0" \
    org.label-schema.url="https://github.com/shawly/hassio-addons" \
    org.label-schema.usage="https://github.com/shawly/hassio-api-scapegoat/tree/master/README.md" \
    org.label-schema.vcs-ref=${BUILD_REF} \
    org.label-schema.vcs-url="https://github.com/shawly/hassio-api-scapegoat" \
    org.label-schema.vendor="shawly"