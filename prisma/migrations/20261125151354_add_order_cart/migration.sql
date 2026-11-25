-- AlterTable
ALTER TABLE `MenuItem` ADD COLUMN `price` DOUBLE NOT NULL DEFAULT 0.0;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `subtotal` DOUBLE NOT NULL DEFAULT 0.0,
    `deliveryFee` DOUBLE NOT NULL DEFAULT 0.0,
    `total` DOUBLE NOT NULL DEFAULT 0.0,
    `paymentMethod` VARCHAR(191) NULL,
    `changeFor` DOUBLE NULL,
    `customerName` VARCHAR(191) NULL,
    `customerPhone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `menuItemId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `size` VARCHAR(191) NULL,
    `flavorHalf1` VARCHAR(191) NULL,
    `flavorHalf2` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `unitPrice` DOUBLE NOT NULL,
    `totalPrice` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_menuItemId_fkey` FOREIGN KEY (`menuItemId`) REFERENCES `MenuItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
