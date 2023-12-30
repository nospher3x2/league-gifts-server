/*
  Warnings:

  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orders_transaction_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orders_transactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_recipient_id_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `orders_transactions` DROP FOREIGN KEY `orders_transactions_item_id_fkey`;

-- DropForeignKey
ALTER TABLE `orders_transactions` DROP FOREIGN KEY `orders_transactions_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `orders_transactions` DROP FOREIGN KEY `orders_transactions_sender_account_id_fkey`;

-- DropTable
DROP TABLE `orders`;

-- DropTable
DROP TABLE `orders_transaction_items`;

-- DropTable
DROP TABLE `orders_transactions`;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `recipient_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderTransaction` (
    `id` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'FULFILLMENT_SUCCESSFUL', 'FAILED', 'OTHER') NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `item_id` VARCHAR(191) NOT NULL,
    `sender_account_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `OrderTransaction_item_id_key`(`item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderTransactionItem` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `currency` ENUM('IP', 'RP') NOT NULL,
    `price` DOUBLE NOT NULL,
    `offer_id` VARCHAR(191) NOT NULL,
    `inventory_type` VARCHAR(191) NOT NULL DEFAULT '',
    `sub_inventory_type` VARCHAR(191) NULL DEFAULT '',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_recipient_id_fkey` FOREIGN KEY (`recipient_id`) REFERENCES `Recipient`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderTransaction` ADD CONSTRAINT `OrderTransaction_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderTransaction` ADD CONSTRAINT `OrderTransaction_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `OrderTransactionItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderTransaction` ADD CONSTRAINT `OrderTransaction_sender_account_id_fkey` FOREIGN KEY (`sender_account_id`) REFERENCES `LeagueAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
