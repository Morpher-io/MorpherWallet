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
CREATE DATABASE IF NOT EXISTS `zerowallet` /*!40100 DEFAULT CHARACTER SET utf8 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `zerowallet`;

-- Dumping structure for table zerowallet.Recovery
CREATE TABLE IF NOT EXISTS `Recovery` (
  `recovery_id` int NOT NULL AUTO_INCREMENT,
  `recoverytype_idfk` int NOT NULL DEFAULT '1',
  `user_idfk` int NOT NULL,
  `recovery_encryptedSeed` text NOT NULL,
  `recovery_key` varchar(255) NOT NULL,
  `recovery_extraInformation` text,
  `recovery_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`recovery_id`),
  KEY `fk_Recovery_RecoveryType_idx` (`recoverytype_idfk`),
  KEY `fk_Recovery_User1_idx` (`user_idfk`),
  CONSTRAINT `fk_Recovery_RecoveryType` FOREIGN KEY (`recoverytype_idfk`) REFERENCES `RecoveryType` (`recoverytype_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_Recovery_User1` FOREIGN KEY (`user_idfk`) REFERENCES `User` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Dumping data for table zerowallet.Recovery: ~0 rows (approximately)
/*!40000 ALTER TABLE `Recovery` DISABLE KEYS */;
/*!40000 ALTER TABLE `Recovery` ENABLE KEYS */;

-- Dumping structure for table zerowallet.RecoveryType
CREATE TABLE IF NOT EXISTS `RecoveryType` (
  `recoverytype_id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`recoverytype_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

-- Dumping data for table zerowallet.RecoveryType: ~4 rows (approximately)
/*!40000 ALTER TABLE `RecoveryType` DISABLE KEYS */;
INSERT IGNORE INTO `RecoveryType` (`recoverytype_id`, `Name`) VALUES
	(1, 'Email/Password'),
	(2, 'Facebook'),
	(3, 'Google'),
	(4, 'Twitter'),
	(5, 'VKontakte');
/*!40000 ALTER TABLE `RecoveryType` ENABLE KEYS */;

-- Dumping structure for table zerowallet.User
CREATE TABLE IF NOT EXISTS `User` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `user_email` varchar(255) NOT NULL,
  `user_created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_email_UNIQUE` (`user_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Dumping data for table zerowallet.User: ~0 rows (approximately)
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
/*!40000 ALTER TABLE `User` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
