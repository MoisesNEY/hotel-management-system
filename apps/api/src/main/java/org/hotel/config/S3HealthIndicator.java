package org.hotel.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

@Component("s3")
public class S3HealthIndicator implements HealthIndicator {

    private final Logger log = LoggerFactory.getLogger(S3HealthIndicator.class);
    
    private final S3Client s3Client;
    private final String bucketName;
    private final String endpoint;

    public S3HealthIndicator(S3Client s3Client, ApplicationProperties applicationProperties) {
        this.s3Client = s3Client;
        ApplicationProperties.S3 s3Props = applicationProperties.getS3();
        this.bucketName = s3Props.getBucket();
        this.endpoint = s3Props.getEndpoint();
    }

    @Override
    public Health health() {
        try {
            if (bucketName == null || bucketName.isEmpty()) {
                return Health.down()
                    .withDetail("error", "S3 bucket not configured")
                    .build();
            }

            HeadBucketRequest headBucketRequest = HeadBucketRequest.builder()
                .bucket(bucketName)
                .build();
            
            s3Client.headBucket(headBucketRequest);

            return Health.up()
                .withDetail("bucket", bucketName)
                .withDetail("endpoint", endpoint != null ? endpoint : "AWS S3")
                .build();
                
        } catch (S3Exception e) {
            log.warn("S3 health check failed: {}", e.getMessage());
            return Health.down()
                .withDetail("error", e.getMessage())
                .withDetail("bucket", bucketName)
                .build();
        } catch (Exception e) {
            log.error("Unexpected error during S3 health check", e);
            return Health.down()
                .withDetail("error", "Connection failed: " + e.getMessage())
                .build();
        }
    }
}
