/*
  Warnings:

  - Added the required column `idUser` to the `Lanca` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lanca" ADD COLUMN     "idUser" TEXT NOT NULL;
