/*
  Warnings:

  - Added the required column `activitiesReportFrequency` to the `Preferences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activitiesReportScrapper` to the `Preferences` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('BI_MONTHLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "Scrapper" AS ENUM ('NAME', 'EMAIL');

-- AlterTable
ALTER TABLE "Preferences" ADD COLUMN     "activitiesReport" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "activitiesReportFrequency" "Frequency" NOT NULL,
ADD COLUMN     "activitiesReportScrapper" "Scrapper" NOT NULL,
ALTER COLUMN "newsletter" SET DEFAULT false;
