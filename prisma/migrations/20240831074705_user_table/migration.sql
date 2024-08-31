-- CreateTable
CREATE TABLE `User` (
    `user_id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_name` VARCHAR(256) NOT NULL,
    `user_email` VARCHAR(191) NOT NULL,
    `user_password` VARCHAR(256) NOT NULL,
    `user_active` BOOLEAN NOT NULL DEFAULT true,
    `user_deleted` BOOLEAN NOT NULL DEFAULT false,
    `user_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_user_email_key`(`user_email`),
    INDEX `User_user_active_idx`(`user_active`),
    INDEX `User_user_deleted_idx`(`user_deleted`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
