-- AlterTable
ALTER TABLE `LeagueAccount` ADD COLUMN `session_queue_token` VARCHAR(191) NULL,
    ADD COLUMN `session_queue_token_expire_at` DATETIME(3) NULL,
    ADD COLUMN `user_info_token` VARCHAR(191) NULL;
