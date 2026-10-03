-- AlterTable
ALTER TABLE "user" ADD COLUMN     "nick" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_nick_key" ON "user"("nick");
