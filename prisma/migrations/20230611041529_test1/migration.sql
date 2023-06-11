/*
  Warnings:

  - Added the required column `dsp` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lcr` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dsp" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "lcr" DOUBLE PRECISION NOT NULL;
