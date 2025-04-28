/*
  Warnings:

  - You are about to alter the column `content` on the `notifications` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - A unique constraint covering the columns `[ticket_file_key]` on the table `order_items` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `notifications` MODIFY `content` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `order_items` ADD COLUMN `ticket_file_key` VARCHAR(36) NULL;

-- AlterTable
ALTER TABLE `orders` ADD COLUMN `invoice_id` VARCHAR(255) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `order_items_ticket_file_key_key` ON `order_items`(`ticket_file_key`);
