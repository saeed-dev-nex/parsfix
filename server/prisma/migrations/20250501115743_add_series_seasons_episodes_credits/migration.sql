/*
  Warnings:

  - Made the column `tmdbId` on table `series` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `series` ADD COLUMN `addedById` VARCHAR(191) NULL,
    ADD COLUMN `adult` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `firstAirDate` DATETIME(3) NULL,
    ADD COLUMN `homepage` VARCHAR(191) NULL,
    ADD COLUMN `lastAirDate` DATETIME(3) NULL,
    ADD COLUMN `numberOfEpisodes` INTEGER NULL,
    ADD COLUMN `numberOfSeasons` INTEGER NULL,
    ADD COLUMN `originalLanguage` VARCHAR(191) NULL,
    ADD COLUMN `originalTitle` VARCHAR(191) NULL,
    ADD COLUMN `popularity` DOUBLE NULL,
    ADD COLUMN `status` ENUM('PENDING', 'PUBLISHED', 'ENDED', 'CANCELED', 'ARCHIVED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `tagline` VARCHAR(191) NULL,
    ADD COLUMN `tmdbStatus` VARCHAR(191) NULL,
    ADD COLUMN `type` VARCHAR(191) NULL,
    MODIFY `tmdbId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `seasons` (
    `id` VARCHAR(191) NOT NULL,
    `tmdbId` INTEGER NULL,
    `seasonNumber` INTEGER NOT NULL,
    `name` VARCHAR(191) NULL,
    `overview` TEXT NULL,
    `airDate` DATETIME(3) NULL,
    `posterPath` VARCHAR(191) NULL,
    `episodeCount` INTEGER NULL,
    `seriesId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `seasons_tmdbId_key`(`tmdbId`),
    UNIQUE INDEX `seasons_seriesId_seasonNumber_key`(`seriesId`, `seasonNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `episodes` (
    `id` VARCHAR(191) NOT NULL,
    `tmdbId` INTEGER NULL,
    `episodeNumber` INTEGER NOT NULL,
    `seasonNumber` INTEGER NOT NULL,
    `title` VARCHAR(191) NULL,
    `overview` TEXT NULL,
    `airDate` DATETIME(3) NULL,
    `runtime` INTEGER NULL,
    `stillPath` VARCHAR(191) NULL,
    `seasonId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `episodes_tmdbId_key`(`tmdbId`),
    UNIQUE INDEX `episodes_seasonId_episodeNumber_key`(`seasonId`, `episodeNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `series_credits` (
    `id` VARCHAR(191) NOT NULL,
    `role` ENUM('ACTOR', 'DIRECTOR', 'WRITER', 'PRODUCER') NOT NULL,
    `characterName` VARCHAR(191) NULL,
    `seriesId` VARCHAR(191) NOT NULL,
    `personId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `series_credits_seriesId_personId_role_characterName_key`(`seriesId`, `personId`, `role`, `characterName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
