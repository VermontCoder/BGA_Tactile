-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: mysql
-- Generation Time: Feb 12, 2025 at 02:49 PM
-- Server version: 5.7.44-log
-- PHP Version: 8.2.24

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ebd_tactile_681820`
--

--
-- Truncate table before insert `pieces`
--

TRUNCATE TABLE `pieces`;
--
-- Dumping data for table `pieces`
--

INSERT INTO `pieces` (`piece_id`, `player_id`, `piece_color`, `location`) VALUES
('piece_2383264_0', 2383264, 'red', '5_1'),
('piece_2383264_1', 2383264, 'red', '4_1'),
('piece_2383265_0', 2383265, 'green', '1_4'),
('piece_2383265_1', 2383265, 'green', '0_4');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
