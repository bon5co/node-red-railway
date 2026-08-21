FROM nodered/node-red:5.0.4

# su-exec so the wrapper entrypoint can repair the root-owned Railway volume
# as root, then drop back to the node-red user before starting the runtime.
USER root
RUN apk add --no-cache su-exec

# Baked settings that read auth + credential secret from the environment on
# every boot. Kept OUTSIDE the /data volume so a mounted volume cannot hide it
# (the openseo trap) and so the credential re-applies each deploy.
COPY settings.js /usr/src/node-red/wrapper-settings.js
COPY railway-entrypoint.sh /usr/local/bin/railway-entrypoint.sh
RUN chmod +x /usr/local/bin/railway-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/railway-entrypoint.sh"]
