FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY target/garagem-0.0.1-SNAPSHOT.jar app.jar
CMD ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar", "--spring.main.banner-mode=off"]
