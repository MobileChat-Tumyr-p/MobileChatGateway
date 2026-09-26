-- CreateTable
CREATE TABLE "user_code" (
    "user_email" TEXT NOT NULL,
    "succses_code" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user_code_user_email_key" ON "user_code"("user_email");
