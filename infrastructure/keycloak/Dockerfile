# infrastructure/keycloak/Dockerfile
FROM quay.io/keycloak/keycloak:26.2.3

# Copiamos el tema desde el contexto de construcción
COPY themes/hotel-theme /opt/keycloak/themes/hotel-theme

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]