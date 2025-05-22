-- DropForeignKey
ALTER TABLE `_userfavoriteactors` DROP FOREIGN KEY `_UserFavoriteActors_A_fkey`;

-- DropForeignKey
ALTER TABLE `_userfavoriteactors` DROP FOREIGN KEY `_UserFavoriteActors_B_fkey`;

-- DropForeignKey
ALTER TABLE `_userfavoritemovies` DROP FOREIGN KEY `_UserFavoriteMovies_A_fkey`;

-- DropForeignKey
ALTER TABLE `_userfavoritemovies` DROP FOREIGN KEY `_UserFavoriteMovies_B_fkey`;

-- DropForeignKey
ALTER TABLE `_userfavoriteseries` DROP FOREIGN KEY `_UserFavoriteSeries_A_fkey`;

-- DropForeignKey
ALTER TABLE `_userfavoriteseries` DROP FOREIGN KEY `_UserFavoriteSeries_B_fkey`;

-- DropForeignKey
ALTER TABLE `password_histories` DROP FOREIGN KEY `password_histories_userId_fkey`;

-- DropIndex
DROP INDEX `password_histories_userId_fkey` ON `password_histories`;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `date_of_birth` DATETIME(3) NULL,
    ADD COLUMN `gender` ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY') NULL;
