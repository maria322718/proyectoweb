# Bundle 03_resources

Proyecto: `clinic-reservations`
Grupo: `03_resources`
### Archivo: `src/main/resources/application.yml`
- Bytes: 528
- Encoding detectado: utf-8

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/consultorios_db
    username: consultorios_user
    password: secret123

  jpa:
    hibernate:
      ddl-auto: update          # crea/actualiza tablas automáticamente (como migrations auto)
    show-sql: true              # muestra las queries SQL en consola (útil para depurar)
    properties:
      hibernate:
        format_sql: true        # formatea el SQL para que sea legible
        dialect: org.hibernate.dialect.PostgreSQLDialect

server:
  port: 8080

```