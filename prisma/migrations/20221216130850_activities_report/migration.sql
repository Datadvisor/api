-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('BI_MONTHLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "Scrapper" AS ENUM ('NAME', 'EMAIL');

-- AlterTable
ALTER TABLE "Preferences" ADD COLUMN     "activitiesReport" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "activitiesReportFrequency" "Frequency",
ADD COLUMN     "activitiesReportScrapper" "Scrapper",
ALTER COLUMN "newsletter" SET DEFAULT false;
