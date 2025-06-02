-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 02, 2025 at 05:36 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `milkteadb`
--

-- --------------------------------------------------------

--
-- Table structure for table `ingredients`
--

CREATE TABLE `ingredients` (
  `ingredient_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `unit` varchar(50) NOT NULL DEFAULT 'grams',
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ingredients`
--

INSERT INTO `ingredients` (`ingredient_id`, `name`, `quantity`, `unit`, `description`, `created_at`, `updated_at`) VALUES
(26, 'Ice Cubes', 49944, 'pieces', 'Frozen water cubes', '2025-05-30 07:58:23', '2025-05-30 07:58:23'),
(27, 'Oreo', 9972, 'pieces', 'Lami na oreo', '2025-05-30 09:28:03', '2025-05-30 09:28:03'),
(28, 'Sugar Daddy', 4294966735, 'grams', 'lami kysi clint ', '2025-05-30 09:29:25', '2025-05-30 09:29:25'),
(29, 'ube', 100, 'grams', 'sarap', '2025-05-30 10:34:44', '2025-05-30 10:34:44');

-- --------------------------------------------------------

--
-- Table structure for table `ingredient_restocks`
--

CREATE TABLE `ingredient_restocks` (
  `restock_id` int(10) UNSIGNED NOT NULL,
  `ingredient_id` int(10) UNSIGNED NOT NULL,
  `quantity_added` int(10) UNSIGNED NOT NULL,
  `restock_date` datetime NOT NULL,
  `restocked_by` int(10) UNSIGNED NOT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `version` varchar(255) NOT NULL,
  `class` varchar(255) NOT NULL,
  `group` varchar(255) NOT NULL,
  `namespace` varchar(255) NOT NULL,
  `time` int(11) NOT NULL,
  `batch` int(11) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `version`, `class`, `group`, `namespace`, `time`, `batch`) VALUES
(1, '2024-05-21-000000', 'App\\Database\\Migrations\\CreateUsersTable', 'default', 'App', 1747841574, 1),
(2, '2025-05-21-224306', 'App\\Database\\Migrations\\CreateUsersProductsTransactionsTables', 'default', 'App', 1747867489, 2),
(3, '2025-05-30-075451', 'App\\Database\\Migrations\\CreateIngredientsTables', 'default', 'App', 1748591725, 3);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `category` enum('milktea','smoothie','iced tea') NOT NULL,
  `ingredients` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int(10) UNSIGNED NOT NULL,
  `description` text DEFAULT NULL,
  `size` varchar(100) DEFAULT NULL,
  `sugar_level` varchar(100) DEFAULT NULL,
  `toppings` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `user_id`, `product_name`, `image`, `category`, `ingredients`, `price`, `stock`, `description`, `size`, `sugar_level`, `toppings`) VALUES
(5, 1, 'Macha', '1747881054_6cf61ac30222cf5e25f4.png', 'milktea', 'n/a', 119.00, 3, 'n/a', 'Large', '100%', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_ingredients`
--

CREATE TABLE `product_ingredients` (
  `id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `ingredient_id` int(10) UNSIGNED NOT NULL,
  `quantity_required` int(10) UNSIGNED NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `sales_id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `quantity` int(10) UNSIGNED DEFAULT NULL,
  `cash_given` decimal(10,2) DEFAULT NULL,
  `change_amount` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`sales_id`, `product_id`, `payment_method`, `quantity`, `cash_given`, `change_amount`) VALUES
(1, 5, 'Cash', 1, 1000.00, 881.00),
(2, 5, 'Cash', 1, 200.00, 81.00),
(3, 5, 'Cash', 1, 200.00, 81.00),
(4, 5, 'Cash', 1, 122.00, 3.00),
(5, 5, 'Cash', 7, 1000.00, 167.00),
(6, 5, 'Cash', 7, 1000.00, 167.00),
(7, 5, 'Cash', 7, 1000.00, 167.00),
(8, 5, 'Cash', 1, 200.00, 81.00),
(9, 5, 'Cash', 3, 1222.00, 865.00),
(10, 5, 'Cash', 1, 1222.00, 1103.00),
(11, 5, 'Cash', 1, 200.00, 81.00),
(12, 5, 'Cash', 4, 500.00, 24.00),
(13, 5, 'Cash', 3, 400.00, 43.00),
(14, 5, 'Cash', 1, 150.00, 31.00),
(15, 5, 'Cash', 1, 31323.00, 31204.00),
(16, 5, 'Cash', 2, 300.00, 62.00),
(17, 5, 'Cash', 5, 1000.00, 405.00);

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `transaction_id` int(10) UNSIGNED NOT NULL,
  `transaction_date` datetime DEFAULT NULL,
  `customer` varchar(255) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `sales_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`transaction_id`, `transaction_date`, `customer`, `total`, `sales_id`) VALUES
(1, '2025-05-22 03:02:58', '', 119.00, 1),
(2, '2025-05-22 03:07:12', '', 119.00, 2),
(3, '2025-05-22 03:07:34', '', 119.00, 3),
(4, '2025-05-22 03:11:09', '', 119.00, 4),
(5, '2025-05-22 03:35:39', '', 833.00, 5),
(6, '2025-05-22 03:35:40', '', 833.00, 6),
(7, '2025-05-22 03:35:40', '', 833.00, 7),
(8, '2025-05-22 04:15:41', '', 119.00, 8),
(9, '2025-05-22 04:19:30', '', 357.00, 9),
(10, '2025-05-22 04:51:57', '', 119.00, 10),
(11, '2025-05-30 09:40:53', '', 119.00, 11),
(12, '2025-05-30 09:42:14', '', 476.00, 12),
(13, '2025-05-30 09:46:19', '', 357.00, 13),
(14, '2025-05-30 09:48:09', '', 119.00, 14),
(15, '2025-05-30 09:48:41', '', 119.00, 15),
(16, '2025-05-30 10:00:31', '', 238.00, 16),
(17, '2025-05-30 10:35:45', '', 595.00, 17);

-- --------------------------------------------------------

--
-- Table structure for table `transaction_products`
--

CREATE TABLE `transaction_products` (
  `id` int(10) UNSIGNED NOT NULL,
  `transaction_id` int(10) UNSIGNED DEFAULT NULL,
  `product_id` int(10) UNSIGNED DEFAULT NULL,
  `sales_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transaction_products`
--

INSERT INTO `transaction_products` (`id`, `transaction_id`, `product_id`, `sales_id`) VALUES
(1, 1, 5, 1),
(2, 2, 5, 2),
(3, 3, 5, 3),
(4, 4, 5, 4),
(5, 5, 5, 5),
(6, 6, 5, 6),
(7, 7, 5, 7),
(8, 8, 5, 8),
(9, 9, 5, 9),
(10, 10, 5, 10),
(11, 11, 5, 11),
(12, 12, 5, 12),
(13, 13, 5, 13),
(14, 14, 5, 14),
(15, 15, 5, 15),
(16, 16, 5, 16),
(17, 17, 5, 17);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) UNSIGNED NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `name`, `created_at`, `updated_at`) VALUES
(1, 'admin@example.com', '$2y$12$e24LGT.ZHS2lJUOB65YWvu5jUHy84FY563EYhN21XZX/c.L7cP3JO', 'Admin User', NULL, NULL),
(2, 'testuser@example.com', '$2y$12$bO.bjtyVts84FV6XhBjsDu7LJOWqLmQ8XJpNtcpAeBDdhiSv0fkAi', NULL, '2025-05-21 15:58:04', '2025-05-21 15:58:04');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ingredients`
--
ALTER TABLE `ingredients`
  ADD PRIMARY KEY (`ingredient_id`);

--
-- Indexes for table `ingredient_restocks`
--
ALTER TABLE `ingredient_restocks`
  ADD PRIMARY KEY (`restock_id`),
  ADD KEY `ingredient_restocks_ingredient_id_foreign` (`ingredient_id`),
  ADD KEY `ingredient_restocks_restocked_by_foreign` (`restocked_by`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD KEY `products_user_id_foreign` (`user_id`);

--
-- Indexes for table `product_ingredients`
--
ALTER TABLE `product_ingredients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_ingredients_product_id_foreign` (`product_id`),
  ADD KEY `product_ingredients_ingredient_id_foreign` (`ingredient_id`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`sales_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `sales_id` (`sales_id`);

--
-- Indexes for table `transaction_products`
--
ALTER TABLE `transaction_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `sales_id` (`sales_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ingredients`
--
ALTER TABLE `ingredients`
  MODIFY `ingredient_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `ingredient_restocks`
--
ALTER TABLE `ingredient_restocks`
  MODIFY `restock_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `product_ingredients`
--
ALTER TABLE `product_ingredients`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `sales_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `transaction_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `transaction_products`
--
ALTER TABLE `transaction_products`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ingredient_restocks`
--
ALTER TABLE `ingredient_restocks`
  ADD CONSTRAINT `ingredient_restocks_ingredient_id_foreign` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`ingredient_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ingredient_restocks_restocked_by_foreign` FOREIGN KEY (`restocked_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_ingredients`
--
ALTER TABLE `product_ingredients`
  ADD CONSTRAINT `product_ingredients_ingredient_id_foreign` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`ingredient_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `product_ingredients_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`sales_id`) REFERENCES `sales` (`sales_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transaction_products`
--
ALTER TABLE `transaction_products`
  ADD CONSTRAINT `transaction_products_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`transaction_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transaction_products_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `transaction_products_ibfk_3` FOREIGN KEY (`sales_id`) REFERENCES `sales` (`sales_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
