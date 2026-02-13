# Non-Negotiables — Repo A

Правила, которые **нельзя нарушать** при реализации.

1. **ws-hub = single replica.** Railway не поддерживает sticky sessions ([docs](https://docs.railway.com/deployments/scaling)). Несколько реплик WS без внешней шины → клиенты получают неполный поток. Масштабирование WS только через внешний pub/sub.

2. **Raw тики НЕ пишутся в PostgreSQL.** Tick-log хранится как chunk-файлы в S3-compatible bucket. В Postgres — только индекс (`tick_files_index`).

3. **Volumes не используются** в сервисах, которым нужны replicas. Railway запрещает replicas + volumes одновременно ([docs](https://docs.railway.com/volumes/reference)).

4. **Обязательный `schema_version`** в каждом event envelope. Обратная совместимость: новые поля — опциональны, удаление/переименование — только через bump версии.

5. **Обязательный raw/agg режим + backpressure.** ws-hub поддерживает два режима выдачи: `raw` (все события) и `agg` (агрегированные снапшоты с настраиваемой частотой). Лимит буфера на клиента; при переполнении — drop oldest или disconnect.

6. **Tick-log chunking + индекс + replay.** Chunks: NDJSON/gzip, flush по размеру или времени. Индекс в Postgres. Replay через presigned URLs (до 90 дней, [docs](https://docs.railway.com/storage-buckets)).

7. **Observability через stdout/stderr.** Railway собирает логи из stdout/stderr ([docs](https://docs.railway.com/observability/logs)). Structured JSON logs. Всё, что нужно хранить >30 дней (аудит, critical events) — дублируется в Postgres `health_events`.

8. **Никаких API keys бирж.** Repo A работает только с public endpoints. Bucket credentials — через env vars, не в коде.

9. **Единый event envelope.** Все каналы используют один и тот же формат конверта. Channel-specific данные — в `payload`.

10. **md-collector: single replica до появления планировщика подписок.** Без шардинга ответственности масштабирование приведёт к дублированию данных.
