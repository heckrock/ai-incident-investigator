export const SAMPLE_INCIDENT = `INCIDENT: INC-2026-0514 — Payment API Degradation
SEVERITY: SEV-1 | STATUS: Resolved | DURATION: 47 minutes
AFFECTED SERVICES: payment-api, checkout-service, order-processor
REGION: us-east-1 | CUSTOMER IMPACT: ~12,400 failed transactions

=== ALERT TIMELINE ===
[2026-05-14 08:12:04 UTC] PagerDuty: payment-api error rate > 15% (threshold: 5%)
[2026-05-14 08:13:22 UTC] Grafana alert: p99 latency 8.2s on /v2/charges (baseline: 180ms)
[2026-05-14 08:14:01 UTC] Status page updated: "Investigating payment processing delays"

=== WAR ROOM / TROUBLESHOOTING CHANNEL (#inc-0514-payments) ===
08:15 @alice.sre: On bridge. Seeing 503s from payment-api pods. HPA shows 24/24 pods, all "Ready"
08:16 @bob.backend: Checked recent deploys — payment-api v3.14.2 rolled out 08:07 UTC (7 min before alert)
08:18 @carol.db: RDS payment-db CPU at 94%. Active connections: 487/500 max
08:19 @bob.backend: New connection pool config in v3.14.2 — maxPoolSize bumped from 20 to 50 per pod
08:20 @alice.sre: Math: 24 pods × 50 connections = 1,200 potential connections vs 500 RDS limit
08:22 @carol.db: Confirmed. Connection exhaustion causing query timeouts → 503 cascade
08:24 @dave.platform: Rolling back payment-api to v3.14.1
08:28 @alice.sre: Error rate dropping — now 4.2%
08:31 @carol.db: RDS connections back to 142, CPU 38%
08:59 @alice.sre: All metrics nominal. Closing bridge.

=== GRAFANA / OBSERVABILITY SNAPSHOTS ===
- Loki: "FATAL: remaining connection slots are reserved for non-replication superuser connections"
- Tempo traces: checkout → payment-api spans failing at 8.2s with "connection pool timeout"
- Prometheus: payment_db_connections_active{state="waiting"} spiked to 312 at 08:17

=== CUSTOMER IMPACT ===
- 12,412 failed charge attempts (Stripe webhook retries queued)
- 847 support tickets auto-generated
- Estimated revenue at risk: $284,000 (based on avg cart value)

=== IMMEDIATE ACTIONS TAKEN ===
1. Rolled back payment-api v3.14.2 → v3.14.1
2. Added RDS connection alarm at 70% threshold
3. Blocked v3.14.2 deploy pipeline pending review`;
