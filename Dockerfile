FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY target/garagem-0.0.1-SNAPSHOT.jar app.jar
ENV SPRING_PROFILES_ACTIVE=prod
ENTRYPOINT ["java", "-jar", "app.jar"]
