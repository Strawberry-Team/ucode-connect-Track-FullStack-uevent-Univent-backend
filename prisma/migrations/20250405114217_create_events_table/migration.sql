-- CreateTable
CREATE TABLE `events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `format_id` INTEGER NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `venue` VARCHAR(255) NOT NULL,
    `location_coordinates` VARCHAR(191) NOT NULL,
    `started_at` DATETIME(3) NOT NULL,
    `ended_at` DATETIME(3) NOT NULL,
    `published_at` DATETIME(3) NOT NULL,
    `tickets_available_from` DATETIME(3) NOT NULL,
    `poster_name` VARCHAR(255) NOT NULL DEFAULT 'default-poster.png',
    `attendee_visibility` ENUM('everyone', 'attendees_only', 'nobody') NOT NULL DEFAULT 'everyone',
    `status` ENUM('draft', 'published', 'sales_started', 'ongoing', 'finished', 'cancelled') NOT NULL DEFAULT 'draft',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
