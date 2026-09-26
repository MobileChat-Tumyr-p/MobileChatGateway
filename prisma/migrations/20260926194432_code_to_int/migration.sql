/*
  Warnings:

  - Changed the type of `succses_code` on the `user_code` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "user_code" DROP COLUMN "succses_code",
ADD COLUMN     "succses_code" INTEGER NOT NULL;
