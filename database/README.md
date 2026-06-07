# Database SQL files

These files are **superseded** by Flyway migrations in:

`backend/src/main/resources/db/migration/`

**Do not apply manually** unless you are doing a one-off local bootstrap outside Spring Boot.

Flyway runs automatically on Spring Boot startup (`spring.flyway.enabled=true`). For manual migration:

```bash
cd backend
./mvnw flyway:migrate
```

The SQL files in this folder remain for Docker Compose MySQL init (`database.sql`, `seed.sql`) and reference only. For schema changes, add a new `V{n}__description.sql` migration — do not edit production schema here.
