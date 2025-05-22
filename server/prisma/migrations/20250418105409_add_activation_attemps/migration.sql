-- AlterTable
ALTER TABLE `users` ADD COLUMN `activationFailedAttempts` INTEGER NOT NULL DEFAULT 0;
