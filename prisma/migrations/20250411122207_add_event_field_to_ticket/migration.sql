-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_event_id_fk` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
