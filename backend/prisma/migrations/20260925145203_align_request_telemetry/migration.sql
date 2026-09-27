-- AlterTable
ALTER TABLE "request_events" ADD COLUMN     "endpoint" TEXT,
ADD COLUMN     "errorCode" TEXT,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "errorProvider" TEXT,
ADD COLUMN     "errorStage" TEXT,
ADD COLUMN     "errorStatusCode" INTEGER,
ADD COLUMN     "requestId" UUID;

-- CreateIndex
CREATE INDEX "request_events_requestId_idx" ON "request_events"("requestId");

-- CreateIndex
CREATE INDEX "request_events_endpoint_idx" ON "request_events"("endpoint");
