package org.hotel.config;

import com.paypal.sdk.Environment;
import com.paypal.sdk.PaypalServerSdkClient;
import com.paypal.sdk.authentication.ClientCredentialsAuthModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PayPalConfig {

    private final Logger log = LoggerFactory.getLogger(PayPalConfig.class);

    @Value("${paypal.client-id}")
    private String clientId;

    @Value("${paypal.client-secret}")
    private String clientSecret;

    @Value("${paypal.mode}")
    private String mode;

    @Bean
    public PaypalServerSdkClient paypalClient() {
        log.info("Configuring PayPal Client in {} mode", mode);

        Environment environment = "live".equalsIgnoreCase(mode) ? Environment.PRODUCTION : Environment.SANDBOX;

        return new PaypalServerSdkClient.Builder()
            .clientCredentialsAuth(new ClientCredentialsAuthModel.Builder(clientId, clientSecret).build())
            .environment(environment)
            .build();
    }
}
