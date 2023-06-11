/*
  Warnings:

  - You are about to drop the column `idUsera` on the `Lanca` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Lanca` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lanca" DROP COLUMN "idUsera",
ADD COLUMN     "userId" TEXT NOT NULL;
