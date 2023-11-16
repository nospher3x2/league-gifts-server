/*
  Warnings:

  - Added the required column `type` to the `LeagueAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipient_id` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `LeagueAccount` ADD COLUMN `type` ENUM('GIFT', 'MANAGER') NOT NULL;

-- AlterTable
ALTER TABLE `orders` ADD COLUMN `recipient_id` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Recipient` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `region` VARCHAR(191) NOT NULL,
    `profileIconId` INTEGER NOT NULL,
    `required_profile_icon_id` INTEGER NOT NULL,
    `puuid` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'VERIFIED', 'REMOVED') NOT NULL DEFAULT 'PENDING',
    `userId` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Recipient` ADD CONSTRAINT `Recipient_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_recipient_id_fkey` FOREIGN KEY (`recipient_id`) REFERENCES `Recipient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
