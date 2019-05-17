/*
SQLyog Ultimate v12.4.3 (64 bit)
MySQL - 10.1.16-MariaDB : Database - ptw_it
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`ptw_it` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `ptw_it`;

/*Table structure for table `tbl_inventory` */

DROP TABLE IF EXISTS `tbl_inventory`;

CREATE TABLE `tbl_inventory` (
  `id` int(9) NOT NULL AUTO_INCREMENT,
  `jenisBarang` enum('Hardware','Software') DEFAULT NULL,
  `namaBarang` varchar(255) DEFAULT NULL,
  `kodeBarang` varchar(255) DEFAULT NULL,
  `divisi` varchar(255) DEFAULT NULL,
  `keterangan` text,
  `masaBerlaku` varchar(222) DEFAULT NULL,
  `createdDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdBy` varchar(255) DEFAULT NULL,
  `pathFile` varchar(255) DEFAULT NULL,
  `serial` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=140 DEFAULT CHARSET=latin1;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
