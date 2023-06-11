/*
  Warnings:

  - You are about to drop the column `idUser` on the `Lanca` table. All the data in the column will be lost.
  - Added the required column `idUsera` to the `Lanca` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lanca" DROP COLUMN "idUser",
ADD COLUMN     "idUsera" TEXT NOT NULL;
