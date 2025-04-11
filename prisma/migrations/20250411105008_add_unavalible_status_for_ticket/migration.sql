-- AlterTable
ALTER TABLE `tickets` MODIFY `status` ENUM('sold', 'reserved', 'available', 'unavailable') NOT NULL DEFAULT 'unavailable';
