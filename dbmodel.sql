
-- ------
-- BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
-- tactile implementation : © <Your name here> <Your email address here>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-- -----

-- dbmodel.sql

-- This is the file where you are describing the database schema of your game
-- Basically, you just have to export from PhpMyAdmin your table structure and copy/paste
-- this export here.
-- Note that the database itself and the standard tables ("global", "stats", "gamelog" and "player") are
-- already created and must not be created here

-- Note: The database schema is created from this file when the game starts. If you modify this file,
--       you have to restart a game to see your changes in database.

-- Example 1: create a standard "card" table to be used with the "Deck" tools (see example game "hearts"):

-- CREATE TABLE IF NOT EXISTS `card` (
--   `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
--   `card_type` varchar(16) NOT NULL,
--   `card_type_arg` int(11) NOT NULL,
--   `card_location` varchar(16) NOT NULL,
--   `card_location_arg` int(11) NOT NULL,
--   PRIMARY KEY (`card_id`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;


-- Example 2: add a custom field to the standard "player" table
-- ALTER TABLE `player` ADD `player_my_custom_field` INT UNSIGNED NOT NULL DEFAULT '0';

ALTER TABLE `player` ADD `color_name` VARCHAR(15) NOT NULL;
ALTER TABLE `player` ADD `red_resource_qty` INT UNSIGNED NOT NULL DEFAULT 0;
ALTER TABLE `player` ADD `blue_resource_qty` INT UNSIGNED NOT NULL DEFAULT 0;
ALTER TABLE `player` ADD `green_resource_qty` INT UNSIGNED NOT NULL DEFAULT 0;
ALTER TABLE `player` ADD `yellow_resource_qty` INT UNSIGNED NOT NULL DEFAULT 0;


-- card_type: color_type_resourceColor1_resourceColor2
-- card_type_arg: 0 - innactive, 1 - active, 2 - exhausted

-- card_location: "deck", "hand", "discard", "store"
-- card_location_arg: player_id if in hand, null otherwise.
-- card_id corresponds to offset into card sprite sheet.

CREATE TABLE IF NOT EXISTS `card` (
  `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `card_type` varchar(30) DEFAULT NULL, 
  `card_type_arg` int(11) DEFAULT NULL,
  `card_location` varchar(16) DEFAULT NULL,
  `card_location_arg` int(11) DEFAULT NULL,
  PRIMARY KEY (`card_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- tile_id: of the form 'x_y' , like 2_3 or 0_0
-- color: one of 'red', 'blue', 'green', 'yellow'

CREATE TABLE IF NOT EXISTS `board` (
  `tile_id` varchar(3) NOT NULL, 
  `color` varchar(10) DEFAULT NULL, 
  PRIMARY KEY (`tile_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ;

-- piece_id:  "player_id_piece_id"
CREATE TABLE IF NOT EXISTS `pieces` (
  `piece_id` varchar(16) NOT NULL,
  `piece_owner` int(11) unsigned NOT NULL,
  `piece_color` varchar(10) NOT NULL, 
  `finished` tinyint(1) NOT NULL,
  `location` varchar(3) NOT NULL,
  PRIMARY KEY (`piece_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `action_board_selections` (
  `selection_div_id` varchar(50) NOT NULL,
  `action` varchar(30) NOT NULL, 
  `player_id` int(11) unsigned NOT NULL,
  `selected` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`selection_div_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;