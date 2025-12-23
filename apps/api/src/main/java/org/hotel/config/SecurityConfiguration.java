package org.hotel.config;

import org.hotel.security.AuthoritiesConstants;
import org.hotel.security.SecurityUtils;
import org.hotel.security.oauth2.AudienceValidator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.servlet.util.matcher.MvcRequestMatcher;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.handler.HandlerMappingIntrospector;
import tech.jhipster.config.JHipsterProperties;

import java.util.Collection;

import static org.springframework.security.config.Customizer.withDefaults;
import static org.springframework.security.oauth2.core.oidc.StandardClaimNames.PREFERRED_USERNAME;

@Configuration
@EnableMethodSecurity(securedEnabled = true)
public class SecurityConfiguration {

    private final JHipsterProperties jHipsterProperties;

    @Value("${spring.security.oauth2.client.provider.oidc.issuer-uri}")
    private String issuerUri;

    public SecurityConfiguration(JHipsterProperties jHipsterProperties) {
        this.jHipsterProperties = jHipsterProperties;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, MvcRequestMatcher.Builder mvc, CorsFilter corsFilter)
            throws Exception {
        http
                .addFilterBefore(corsFilter,
                        org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class)
                .csrf(AbstractHttpConfigurer::disable)
                
                .authorizeHttpRequests(authz ->
                // prettier-ignore
                authz
                        // Endpoints públicos
                        .requestMatchers(mvc.pattern(HttpMethod.GET, "/api/room-types")).permitAll()
                        .requestMatchers(mvc.pattern(HttpMethod.GET, "/api/room-types/*")).permitAll()
                        .requestMatchers(mvc.pattern(HttpMethod.GET, "/api/hotel-services")).permitAll()
                        .requestMatchers(mvc.pattern(HttpMethod.GET, "/api/hotel-services/*")).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/public/**").permitAll()
                        .requestMatchers(mvc.pattern("/api/authenticate")).permitAll()
                        .requestMatchers(mvc.pattern("/api/auth-info")).permitAll()

                        // Endpoint de cuentas (Perfil de usuario)
                        .requestMatchers(mvc.pattern("/api/account/**")).authenticated()

                        // Endpoints de clientes - solo ROLE_CLIENT
                        .requestMatchers(mvc.pattern("/api/client/**")).hasAuthority(AuthoritiesConstants.CLIENT)

                        // --- Endpoints de empleado y administrador ---
                        
                        // Acciones específicas de gestión de reservas y servicios
                        .requestMatchers(mvc.pattern(HttpMethod.PATCH, "/api/bookings/*/assign-room"))
                            .hasAnyAuthority(AuthoritiesConstants.EMPLOYEE, AuthoritiesConstants.ADMIN)
                        .requestMatchers(mvc.pattern(HttpMethod.PATCH, "/api/bookings/*/check-in"))
                            .hasAnyAuthority(AuthoritiesConstants.EMPLOYEE, AuthoritiesConstants.ADMIN)
                        .requestMatchers(mvc.pattern(HttpMethod.PATCH, "/api/bookings/*/check-out"))
                            .hasAnyAuthority(AuthoritiesConstants.EMPLOYEE, AuthoritiesConstants.ADMIN)
                        .requestMatchers(mvc.pattern(HttpMethod.PATCH, "/api/service-requests/*/status"))
                            .hasAnyAuthority(AuthoritiesConstants.EMPLOYEE, AuthoritiesConstants.ADMIN)
                        
                        // Consultas generales (Listados) permitidas para empleados
                        .requestMatchers(mvc.pattern(HttpMethod.GET, "/api/bookings")).hasAnyAuthority(AuthoritiesConstants.EMPLOYEE, AuthoritiesConstants.ADMIN)
                        .requestMatchers(mvc.pattern(HttpMethod.GET, "/api/bookings/*")).hasAnyAuthority(AuthoritiesConstants.EMPLOYEE, AuthoritiesConstants.ADMIN)
                        .requestMatchers(mvc.pattern(HttpMethod.GET, "/api/service-requests")).hasAnyAuthority(AuthoritiesConstants.EMPLOYEE, AuthoritiesConstants.ADMIN)
                        .requestMatchers(mvc.pattern(HttpMethod.GET, "/api/service-requests/*")).hasAnyAuthority(AuthoritiesConstants.EMPLOYEE, AuthoritiesConstants.ADMIN)
                        
                        // NUEVO: Permisos de lectura para Clientes, Pagos y Facturas para empleados
                        .requestMatchers(mvc.pattern(HttpMethod.GET, "/api/customer-details/**"))
                            .hasAnyAuthority(AuthoritiesConstants.EMPLOYEE, AuthoritiesConstants.ADMIN)
                        .requestMatchers(mvc.pattern(HttpMethod.GET, "/api/payments/**"))
                            .hasAnyAuthority(AuthoritiesConstants.EMPLOYEE, AuthoritiesConstants.ADMIN)
                        .requestMatchers(mvc.pattern(HttpMethod.GET, "/api/invoices/**"))
                            .hasAnyAuthority(AuthoritiesConstants.EMPLOYEE, AuthoritiesConstants.ADMIN)
                        .requestMatchers(mvc.pattern(HttpMethod.GET, "/api/rooms/**"))
                            .hasAnyAuthority(AuthoritiesConstants.EMPLOYEE, AuthoritiesConstants.ADMIN)

                        // Endpoints exclusivos de administrador
                        .requestMatchers(mvc.pattern("/api/admin/**")).hasAuthority(AuthoritiesConstants.ADMIN)
                        .requestMatchers(mvc.pattern("/v3/api-docs/**")).hasAuthority(AuthoritiesConstants.ADMIN)
                        .requestMatchers(mvc.pattern("/management/health")).permitAll()
                        .requestMatchers(mvc.pattern("/management/health/**")).permitAll()
                        .requestMatchers(mvc.pattern("/management/info")).permitAll()
                        .requestMatchers(mvc.pattern("/management/prometheus")).permitAll()
                        .requestMatchers(mvc.pattern("/management/**")).hasAuthority(AuthoritiesConstants.ADMIN)

                        // Regla final: cualquier otro endpoint /api/** requiere rol ADMIN
                        .requestMatchers(mvc.pattern("/api/**")).hasAuthority(AuthoritiesConstants.ADMIN))
                
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .oauth2ResourceServer(
                        oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(authenticationConverter())))
                .oauth2Client(withDefaults());
        return http.build();
    }

    @Bean
    MvcRequestMatcher.Builder mvc(HandlerMappingIntrospector introspector) {
        return new MvcRequestMatcher.Builder(introspector);
    }

    Converter<Jwt, AbstractAuthenticationToken> authenticationConverter() {
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(
                new Converter<Jwt, Collection<GrantedAuthority>>() {
                    @Override
                    public Collection<GrantedAuthority> convert(Jwt jwt) {
                        return SecurityUtils.extractAuthorityFromClaims(jwt.getClaims());
                    }
                });
        jwtAuthenticationConverter.setPrincipalClaimName(PREFERRED_USERNAME);
        return jwtAuthenticationConverter;
    }

    @Bean
    JwtDecoder jwtDecoder() {
        NimbusJwtDecoder jwtDecoder = JwtDecoders.fromOidcIssuerLocation(issuerUri);

        OAuth2TokenValidator<Jwt> audienceValidator = new AudienceValidator(
                jHipsterProperties.getSecurity().getOauth2().getAudience());
        OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(issuerUri);
        OAuth2TokenValidator<Jwt> withAudience = new DelegatingOAuth2TokenValidator<>(withIssuer, audienceValidator);

        jwtDecoder.setJwtValidator(withAudience);

        return jwtDecoder;
    }
}