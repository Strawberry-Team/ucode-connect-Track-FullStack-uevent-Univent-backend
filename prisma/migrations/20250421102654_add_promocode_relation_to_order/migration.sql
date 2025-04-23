-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_promo_code_id_fk` FOREIGN KEY (`promo_code_id`) REFERENCES `promo_codes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
