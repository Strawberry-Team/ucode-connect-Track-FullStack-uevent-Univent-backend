-- CreateTable
CREATE TABLE `event_themes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `event_themes_title_key`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `events_themes_relations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `event_id` INTEGER NOT NULL,
    `theme_id` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `event_theme_relations_event_id_fk`(`event_id`),
    INDEX `event_theme_relations_theme_id_fk`(`theme_id`),
    UNIQUE INDEX `event_theme_relations_event_id_theme_id_uq`(`event_id`, `theme_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `events_themes_relations` ADD CONSTRAINT `event_theme_relations_event_id_fk` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `events_themes_relations` ADD CONSTRAINT `event_theme_relations_theme_id_fk` FOREIGN KEY (`theme_id`) REFERENCES `event_themes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
