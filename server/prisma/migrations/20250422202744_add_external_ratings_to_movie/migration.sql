/*
  Warnings:

  - A unique constraint covering the columns `[tmdbId]` on the table `movies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[imdbId]` on the table `movies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tmdbId]` on the table `persons` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tmdbId]` on the table `series` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tmdbId` to the `movies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `movies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tmdbId` to the `persons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `series` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `movies` ADD COLUMN `addedById` VARCHAR(191) NULL,
    ADD COLUMN `adult` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `backdropPath` VARCHAR(191) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `imdbId` VARCHAR(191) NULL,
    ADD COLUMN `imdbRating` DOUBLE NULL,
    ADD COLUMN `originalLanguage` VARCHAR(191) NULL,
    ADD COLUMN `originalTitle` VARCHAR(191) NULL,
    ADD COLUMN `popularity` DOUBLE NULL,
    ADD COLUMN `posterPath` VARCHAR(191) NULL,
    ADD COLUMN `releaseDate` DATETIME(3) NULL,
    ADD COLUMN `rottenTomatoesScore` INTEGER NULL,
    ADD COLUMN `runtime` INTEGER NULL,
    ADD COLUMN `status` ENUM('PUBLISHED', 'PENDING', 'ARCHIVED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `tagline` VARCHAR(191) NULL,
    ADD COLUMN `tmdbId` INTEGER NOT NULL,
    ADD COLUMN `trailerUrl` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `persons` ADD COLUMN `biography` TEXT NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NULL,
    ADD COLUMN `tmdbId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `series` ADD COLUMN `backdropPath` VARCHAR(191) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `posterPath` VARCHAR(191) NULL,
    ADD COLUMN `tmdbId` INTEGER NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `password` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `genres` (
    `id` VARCHAR(191) NOT NULL,
    `tmdbId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NULL,

    UNIQUE INDEX `genres_tmdbId_key`(`tmdbId`),
    UNIQUE INDEX `genres_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `movie_credits` (
    `id` VARCHAR(191) NOT NULL,
    `role` ENUM('ACTOR', 'DIRECTOR', 'WRITER', 'PRODUCER') NOT NULL,
    `characterName` VARCHAR(191) NULL,
    `movieId` VARCHAR(191) NOT NULL,
    `personId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `movie_credits_movieId_personId_role_characterName_key`(`movieId`, `personId`, `role`, `characterName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comments` (
    `id` VARCHAR(191) NOT NULL,
    `text` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `movieId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ratings` (
    `id` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `movieId` VARCHAR(191) NULL,

    UNIQUE INDEX `ratings_userId_movieId_key`(`userId`, `movieId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_MovieGenres` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_MovieGenres_AB_unique`(`A`, `B`),
    INDEX `_MovieGenres_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_SeriesGenres` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_SeriesGenres_AB_unique`(`A`, `B`),
    INDEX `_SeriesGenres_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `movies_tmdbId_key` ON `movies`(`tmdbId`);

-- CreateIndex
CREATE UNIQUE INDEX `movies_imdbId_key` ON `movies`(`imdbId`);

-- CreateIndex
CREATE UNIQUE INDEX `persons_tmdbId_key` ON `persons`(`tmdbId`);

-- CreateIndex
CREATE UNIQUE INDEX `series_tmdbId_key` ON `series`(`tmdbId`);
