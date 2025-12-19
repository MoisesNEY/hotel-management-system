package org.hotel.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;

import java.net.URI;

@Configuration
public class S3Configuration {

    private final ApplicationProperties applicationProperties;

    public S3Configuration(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

    @Bean
    public S3Client s3Client() {
        ApplicationProperties.S3 s3Properties = applicationProperties.getS3();
        S3ClientBuilder builder = S3Client.builder()
        .forcePathStyle(true)
            .region(Region.of(s3Properties.getRegion()));

        if (s3Properties.getAccessKey() != null && !s3Properties.getAccessKey().isEmpty() &&
            s3Properties.getSecretKey() != null && !s3Properties.getSecretKey().isEmpty()) {
            builder.credentialsProvider(StaticCredentialsProvider.create(
                AwsBasicCredentials.create(s3Properties.getAccessKey(), s3Properties.getSecretKey())
            ));
        }

        if (s3Properties.getEndpoint() != null && !s3Properties.getEndpoint().isEmpty()) {
            builder.endpointOverride(URI.create(s3Properties.getEndpoint()));
        }

        return builder.build();
    }
}
