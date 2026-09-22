# Stage 1: Build application using Maven and Temurin JDK 21
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Pre-fetch dependencies to leverage Docker layer caching
COPY pom.xml .
RUN mvn dependency:resolve -B

# Copy application source code and package executable jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal, secure production runtime
FROM eclipse-temurin:21-jre-alpine AS runtime

# Install curl for health check probing
RUN apk add --no-cache curl tzdata

# Create dedicated unprivileged user and group
RUN addgroup -S spring && adduser -S spring -G spring

WORKDIR /app

# Copy executable jar from builder stage
COPY --from=builder --chown=spring:spring /build/target/*.jar /app/app.jar

USER spring:spring

EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
