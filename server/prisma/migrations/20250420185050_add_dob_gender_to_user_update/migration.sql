/*
  Warnings:

  - You are about to drop the column `date_of_birth` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `date_of_birth`,
    ADD COLUMN `dateOfBirth` DATETIME(3) NULL;
