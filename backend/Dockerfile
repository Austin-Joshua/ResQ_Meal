# Multi-stage: Maven build → JRE Alpine runtime
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

COPY pom.xml .
COPY .mvn .mvn
COPY mvnw mvnw.cmd ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

COPY src ./src
RUN ./mvnw package -DskipTests -B

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN addgroup -S resqmeal && adduser -S resqmeal -G resqmeal

COPY --from=build /app/target/resqmeal-server-*.jar app.jar
RUN mkdir -p uploads && chown -R resqmeal:resqmeal uploads

USER resqmeal
EXPOSE 8080 9090

ENTRYPOINT ["java", "-jar", "app.jar"]
