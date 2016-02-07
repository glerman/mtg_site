
CREATE TABLE `cd_card` (
   cd_id MEDIUMINT(10) NOT NULL AUTO_INCREMENT,
   cd_multiverse_id MEDIUMINT(10) UNSIGNED NOT NULL,
   cd_name VARCHAR(150) NOT NULL,

   PRIMARY KEY (cd_id)
) ENGINE=INNODB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPRESSED;


CREATE TABLE `dk_deck` (
   dk_id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
   dk_name VARCHAR(256) NOT NULL,
   dk_origin_url VARCHAR(256) NOT NULL,
   dk_mainboard TEXT NOT NULL,
   dk_sideboard TEXT,
   
   PRIMARY KEY (dk_id)
) ENGINE=INNODB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPRESSED;


CREATE TABLE `dkrf_deck` (
   dkrf_id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
   dkrf_name VARCHAR(256) NOT NULL,
   dkrf_origin_url VARCHAR(256) NOT NULL,
  
  PRIMARY KEY (`dkrf_id`)
) ENGINE=INNODB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPRESSED;


CREATE TABLE `dc_deck_card` (
   dc_id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
   dc_deck_id INT(10) UNSIGNED NOT NULL,
   dc_card_id MEDIUMINT(10) UNSIGNED NOT NULL,
   dc_amount MEDIUMINT(3) UNSIGNED NOT NULL,
   dc_is_sideboard TINYINT(1) NOT NULL,
  
  PRIMARY KEY (`dc_id`),
  KEY `dc_deck_id_fk` (`dc_deck_id`)
) ENGINE=INNODB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPRESSED;


CREATE TABLE `cdi_card_decks_index` (
   cdi_card_id MEDIUMINT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
   cdi_mainboard_appearances LONGTEXT NOT NULL,
   cdi_sideboard_appearances LONGTEXT,
   
   PRIMARY KEY (cdi_card_id)
) ENGINE=INNODB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPRESSED;

CREATE TABLE `ctd_card_to_decks` (
  `cda_card_id` MEDIUMINT(10) UNSIGNED NOT NULL,
  `cda_deck_id` INT(10) UNSIGNED NOT NULL,
  `cda_is_sideboard` TINYINT(1),
  
  KEY (`cda_card_id`)
) ENGINE=INNODB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPRESSED;


-- Assume we have SPLIT_STRINGS_TO_ROWS function (http://stackoverflow.com/questions/17942508/sql-split-values-to-multiple-rows): 
-- Assume cdi_mainboard_appearances holds only deck ids
SELECT deck_ids, count(*) FROM

 SPLIT_STRING_TO_ROWS(',', SELECT `cdi_mainboard_appearances` FROM `cdi_card_decks_index` WHERE `cdi_card_id` IN(input_1, input_2, ...))  	AS deck_ids

GROUP BY deck_ids
ORDER BY count(*) DESC
LIMIT 10

CREATE TABLE numbers (
  n INT(10) NOT NULL  
)

INSERT INTO numbers 
SELECT
    SEQ.SeqValue
FROM
(
SELECT
    (HUNDRED_THOUSANDS.SeqValue + TEN_THOUSENDS.SeqValue +  THOUSANDS.SeqValue + HUNDREDS.SeqValue + TENS.SeqValue + ONES.SeqValue) SeqValue
FROM
    (
    SELECT 0  SeqValue
    UNION ALL
    SELECT 1 SeqValue
    UNION ALL
    SELECT 2 SeqValue
    UNION ALL
    SELECT 3 SeqValue
    UNION ALL
    SELECT 4 SeqValue
    UNION ALL
    SELECT 5 SeqValue
    UNION ALL
    SELECT 6 SeqValue
    UNION ALL
    SELECT 7 SeqValue
    UNION ALL
    SELECT 8 SeqValue
    UNION ALL
    SELECT 9 SeqValue
    ) ONES
CROSS JOIN
    (
    SELECT 0 SeqValue
    UNION ALL
    SELECT 10 SeqValue
    UNION ALL
    SELECT 20 SeqValue
    UNION ALL
    SELECT 30 SeqValue
    UNION ALL
    SELECT 40 SeqValue
    UNION ALL
    SELECT 50 SeqValue
    UNION ALL
    SELECT 60 SeqValue
    UNION ALL
    SELECT 70 SeqValue
    UNION ALL
    SELECT 80 SeqValue
    UNION ALL
    SELECT 90 SeqValue
    ) TENS
CROSS JOIN
    (
    SELECT 0 SeqValue
    UNION ALL
    SELECT 100 SeqValue
    UNION ALL
    SELECT 200 SeqValue
    UNION ALL
    SELECT 300 SeqValue
    UNION ALL
    SELECT 400 SeqValue
    UNION ALL
    SELECT 500 SeqValue
    UNION ALL
    SELECT 600 SeqValue
    UNION ALL
    SELECT 700 SeqValue
    UNION ALL
    SELECT 800 SeqValue
    UNION ALL
    SELECT 900 SeqValue
    ) HUNDREDS
CROSS JOIN
    (
    SELECT 0 SeqValue
    UNION ALL
    SELECT 1000 SeqValue
    UNION ALL
    SELECT 2000 SeqValue
    UNION ALL
    SELECT 3000 SeqValue
    UNION ALL
    SELECT 4000 SeqValue
    UNION ALL
    SELECT 5000 SeqValue
    UNION ALL
    SELECT 6000 SeqValue
    UNION ALL
    SELECT 7000 SeqValue
    UNION ALL
    SELECT 8000 SeqValue
    UNION ALL
    SELECT 9000 SeqValue
    ) THOUSANDS
CROSS JOIN
    (
    SELECT 0 SeqValue
    UNION ALL
    SELECT 10000 SeqValue
    UNION ALL
    SELECT 20000 SeqValue
    UNION ALL
    SELECT 30000 SeqValue
    UNION ALL
    SELECT 40000 SeqValue
    UNION ALL
    SELECT 50000 SeqValue
    UNION ALL
    SELECT 60000 SeqValue
    UNION ALL
    SELECT 70000 SeqValue
    UNION ALL
    SELECT 80000 SeqValue
    UNION ALL
    SELECT 90000 SeqValue
    ) TEN_THOUSENDS
CROSS JOIN
    (
    SELECT 0 SeqValue
    UNION ALL
    SELECT 100000 SeqValue
    UNION ALL
    SELECT 200000 SeqValue
    UNION ALL
    SELECT 300000 SeqValue
    UNION ALL
    SELECT 400000 SeqValue
    UNION ALL
    SELECT 500000 SeqValue
    UNION ALL
    SELECT 600000 SeqValue
    UNION ALL
    SELECT 700000 SeqValue
    UNION ALL
    SELECT 800000 SeqValue
    UNION ALL
    SELECT 900000 SeqValue
    ) HUNDRED_THOUSANDS
            
) SEQ



INSERT INTO dkrf_deck (dkrf_name, dkrf_origin_url) VALUES ('UrzaTron', 'http://mtgtop8.com/event?e=11179&d=263552&f=MO');INSERT INTO dc_deck_card (dc_card_id, dc_amount, dc_is_sideboard) VALUES (14601, 1, 0),(14779, 1, 0),(15485, 2, 0),(10865, 4, 0),(9451, 4, 0),(9452, 4, 0),(9453, 4, 0),(14618, 2, 0),(15319, 3, 0),(13654, 3, 0),(8080, 4, 0),(15305, 4, 0),(4103, 4, 0),(6468, 4, 0),(14617, 4, 0),(14690, 4, 0),(10212, 3, 0),(12536, 3, 0),(14010, 2, 0),(4008, 2, 0),(6239, 1, 0),(15144, 1, 0),(14692, 1, 0),(12626, 4, 0),(14895, 1, 0),(11716, 3, 0),(14218, 2, 0)