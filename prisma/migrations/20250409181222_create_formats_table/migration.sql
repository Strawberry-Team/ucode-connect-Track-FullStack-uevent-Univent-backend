-- CreateTable
CREATE TABLE `event_formats` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `event_formats_title_key`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `events_company_id_fk` ON `events`(`company_id`);

-- CreateIndex
CREATE INDEX `events_format_id_fk` ON `events`(`format_id`);

-- AddForeignKey
ALTER TABLE `events` ADD CONSTRAINT `events_company_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `events` ADD CONSTRAINT `events_format_id_fk` FOREIGN KEY (`format_id`) REFERENCES `event_formats`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
