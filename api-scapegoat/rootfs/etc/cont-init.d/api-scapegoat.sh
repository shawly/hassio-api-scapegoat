#!/usr/bin/with-contenv bashio
# ==============================================================================
# Home Assistant Community Add-on: API Scapegoat
# Sends discovery information to Home Assistant.
# ==============================================================================

if ! bashio::fs.directory_exists '/config/api-scapegoat/'; then
    mkdir -p /config/api-scapegoat \
        || bashio::exit.nok "Failed to create node-red configuration directory"

    # Copy sample json into config folder
    cp /opt/api-scapegoat/config/example.json /config/api-scapegoat/
fi
