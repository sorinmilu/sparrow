-- MySQL dump 10.13  Distrib 5.5.62, for Win64 (AMD64)
--
-- Host: localhost    Database: sparrow
-- ------------------------------------------------------
-- Server version	5.5.5-10.5.9-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `taggroups`
--

DROP TABLE IF EXISTS `taggroups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taggroups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nume` varchar(100) NOT NULL,
  `taglist` text NOT NULL,
  `added` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `taggroups`
--

LOCK TABLES `taggroups` WRITE;
/*!40000 ALTER TABLE `taggroups` DISABLE KEYS */;
INSERT INTO `taggroups` VALUES (1,'trending','[\"covid19\", \"chelsea\", \"spacejam\", \"easter\", \"bbb21\",\"Hodrimeydan\", \"SHINee_BeyondLIVE\", \"Desconjuracao\"]','2021-04-04 07:38:21'),(2,'telefoane','[\"Samsung\",\"Apple\",\"Huawei\",\"Nokia\",\"Sony\",\"LG\",\"HTC\",\"Motorola\",\"Lenovo\",\"Xiaomi\",\"Google\",\"Honor\",\"Oppo\",\"Realme\",\"OnePlus\",\"vivo\",\"Meizu\",\"BlackBerry\",\"Asus\",\"Alcatel\",\"ZTE\",\"Microsoft\",\"Vodafone\"]','2021-04-04 07:39:39'),(3,'popular','[\"PlayStation\",\"Xbox\",\"Chanel\",\"Samsung\",\"Starbucks\",\"MarcJacobs\",\"Burberry\",\"Dior\",\"Nike\",\"LouisVuitton\",\"Netflix\",\"Gucci\",\"Versace\",\"YvesSaintLaurent\"]','2021-04-04 07:40:17'),(4,'programare','[\"php\",\"perl\",\"javascript\",\"ruby\",\"python\",\"lua\",\"scala\",\"golang\", \"cprogramming\", \"cpp\", \"java\", \"visualbasic\"]','2021-04-04 17:39:30'),(5,'valoroase','[\"crypto\",\"influencermarketing\",\"womenshistorymonth\",\"blackhistorymonth\",\"bitcoin\",\"internationalwomensday\",\"iwd2019\",\"competition\",\"pressforprogress\",\"influencer\",\"olympics\",\"datascience\",\"fintech\",\"womenintech\",\"metoo\",\"deeplearning\",\"sxsw\",\"fridayfeeling\",\"cloudsecurity\",\"MondayMotivation\",\"tbt\",\"wcw\",\"thursdaythoughts\",\"traveltuesday\",\"vegan\",\"fitness\",\"blessed\",\"goals\"]','2021-04-04 17:46:07'),(6,'TariEU','[\"Austria\",\"Italy\",\"Belgium\",\"Latvia\",\"Bulgaria\",\"Lithuania\",\"Croatia\",\"Luxembourg\",\"Cyprus\",\"Malta\",\"Czechia\",\"Netherlands\",\"Denmark\",\"Poland\",\"Estonia\",\"Portugal\",\"Finland\",\"Romania\",\"France\",\"Slovakia\",\"Germany\",\"Slovenia\",\"Greece\",\"Spain\",\"Hungary\",\"Sweden\",\"Ireland\"]','2021-04-04 17:51:56');
/*!40000 ALTER TABLE `taggroups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'sparrow'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-04-04 21:42:05
