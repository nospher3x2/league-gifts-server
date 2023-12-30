/*
  Warnings:

  - You are about to drop the column `total_amount` on the `orders` table. All the data in the column will be lost.
  - The values [FINISHED] on the enum `orders_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Cart` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StoreItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CartToStoreItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orders_products` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Cart` DROP FOREIGN KEY `Cart_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `_CartToStoreItem` DROP FOREIGN KEY `_CartToStoreItem_A_fkey`;

-- DropForeignKey
ALTER TABLE `_CartToStoreItem` DROP FOREIGN KEY `_CartToStoreItem_B_fkey`;

-- DropForeignKey
ALTER TABLE `orders_products` DROP FOREIGN KEY `orders_products_item_id_fkey`;

-- DropForeignKey
ALTER TABLE `orders_products` DROP FOREIGN KEY `orders_products_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `orders_products` DROP FOREIGN KEY `orders_products_sender_account_id_fkey`;

-- AlterTable
ALTER TABLE `orders` DROP COLUMN `total_amount`,
    MODIFY `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELED', 'FAILED') NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE `Cart`;

-- DropTable
DROP TABLE `StoreItem`;

-- DropTable
DROP TABLE `_CartToStoreItem`;

-- DropTable
DROP TABLE `orders_products`;

-- CreateTable
CREATE TABLE `orders_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `status` ENUM('ACCEPTED', 'FULFILLMENT_SUCCESSFUL', 'FAILED', 'OTHER') NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `item_id` VARCHAR(191) NOT NULL,
    `sender_account_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `order_transaction_item_id` VARCHAR(191) NULL,

    UNIQUE INDEX `orders_transactions_item_id_key`(`item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders_transaction_items` (
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
ALTER TABLE `orders_transactions` ADD CONSTRAINT `orders_transactions_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders_transactions` ADD CONSTRAINT `orders_transactions_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `orders_transaction_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders_transactions` ADD CONSTRAINT `orders_transactions_sender_account_id_fkey` FOREIGN KEY (`sender_account_id`) REFERENCES `LeagueAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
