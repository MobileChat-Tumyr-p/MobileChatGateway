-- CreateTable
CREATE TABLE "call" (
    "id" TEXT NOT NULL,
    "caller_id" INTEGER NOT NULL,
    "callee_id" INTEGER NOT NULL,
    "room" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ringing',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "call_callee_id_status_idx" ON "call"("callee_id", "status");

-- CreateIndex
CREATE INDEX "call_caller_id_status_idx" ON "call"("caller_id", "status");
