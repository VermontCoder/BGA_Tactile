--
-- Truncate table before insert `pieces`
--

TRUNCATE TABLE `pieces`;
--
-- Dumping data for table `pieces`
--

INSERT INTO `pieces` (`piece_id`, `player_id`, `piece_color`, `location`) VALUES
('piece_2383264_0', 2383264, 'blue', '1_0'),
('piece_2383264_1', 2383264, 'blue', '0_1'),
('piece_2383265_0', 2383265, 'yellow', '4_5'),
('piece_2383265_1', 2383265, 'yellow', '5_4'),
('piece_2383266_0', 2383266, 'red', '4_0'),
('piece_2383266_1', 2383266, 'red', '5_1'),
('piece_2383267_0', 2383267, 'green', '1_5'),
('piece_2383267_1', 2383267, 'green', '0_4');
COMMIT;

--
-- Truncate table before insert `player`
--

TRUNCATE TABLE `player`;
--
-- Dumping data for table `player`
--

INSERT INTO `player` (`player_no`, `player_id`, `player_canal`, `player_name`, `player_avatar`, `player_color`, `player_score`, `player_score_aux`, `player_zombie`, `player_ai`, `player_eliminated`, `player_next_notif_no`, `player_enter_game`, `player_over_time`, `player_is_multiactive`, `player_start_reflexion_time`, `player_remaining_reflexion_time`, `player_beginner`, `player_state`, `color_name`, `red_resource_qty`, `blue_resource_qty`, `green_resource_qty`, `yellow_resource_qty`, `ally_id`) VALUES
(1, 2383266, '2cb0e0a4bbc5536ad3cfbc4e5169ff68', 'FindYodaWinCash2', '000000', 'f10000', 0, 0, 0, 0, 0, 1, 1, 1, 0, '2025-03-13 17:15:47', -1217, NULL, NULL, 'red', 19, 20, 20, 19, 2383267),
(2, 2383265, '7e837eeffc490620bd06b5fbda08c7f1', 'FindYodaWinCash1', '000000', 'f3ac11', 0, 0, 0, 0, 0, 1, 1, 1, 0, NULL, -253, NULL, NULL, 'yellow', 19, 19, 19, 17, 2383264),
(3, 2383267, '0d46c9483ea75cdf7edbf10d621716c8', 'FindYodaWinCash3', '000000', '6ab524', 0, 0, 0, 0, 0, 1, 1, 1, 0, NULL, 111, 0xffffffffffffffffffffffffffffffff, NULL, 'green', 18, 19, 16, 19, 2383266),
(4, 2383264, '5d4da31b972d0b8c68b5f6e300df0d79', 'FindYodaWinCash0', '000000', '0f87da', 0, 0, 0, 0, 0, 1, 1, 1, 0, NULL, -455, NULL, NULL, 'blue', 21, 17, 17, 20, 2383265);
COMMIT;