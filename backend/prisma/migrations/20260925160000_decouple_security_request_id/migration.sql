-- SecurityEvent.requestId stores the gateway request identifier, not RequestEvent.id.
ALTER TABLE "security_events"
DROP CONSTRAINT "security_events_requestId_fkey";