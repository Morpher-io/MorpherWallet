-- --------------------------------------------------------
-- Host:                         localhost
-- Server version:               8.0.20 - MySQL Community Server - GPL
-- Server OS:                    Linux
-- HeidiSQL Version:             10.3.0.5771
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Dumping database structure for zerowallet
CREATE DATABASE IF NOT EXISTS `zerowallet` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `zerowallet`;

-- Dumping structure for table zerowallet.Users
CREATE TABLE IF NOT EXISTS `Users` (
  `users_id` int NOT NULL AUTO_INCREMENT,
  `users_email` varchar(255) NOT NULL DEFAULT '0',
  `users_encrypted_wallet` varchar(255) NOT NULL DEFAULT '0',
  `users_hashed_fb_id` varchar(255) NOT NULL DEFAULT '0',
  `users_hashed_google_id` varchar(255) NOT NULL DEFAULT '0',
  PRIMARY KEY (`users_id`),
  KEY `users_hashed_fb_id` (`users_hashed_fb_id`),
  KEY `users_hashed_google_id` (`users_hashed_google_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table zerowallet.Users: ~0 rows (approximately)
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT IGNORE INTO `Users` (`users_id`, `users_email`, `users_encrypted_wallet`, `users_hashed_fb_id`, `users_hashed_google_id`) VALUES
	(1, 'dummy_user@test.com', '213123123', '123123123', '123123123123');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
