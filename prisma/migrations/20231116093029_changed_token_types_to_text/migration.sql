-- AlterTable
ALTER TABLE `LeagueAccount` MODIFY `partner_token` TEXT NOT NULL,
    MODIFY `session_queue_token` TEXT NULL,
    MODIFY `user_info_token` TEXT NULL;
