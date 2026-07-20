-- ============================================================
-- SALON DEEN - CLEAN SCHEMA (Enum-based, no lookup tables)
-- 26 tables total (down from 42)
-- ============================================================

USE `sdb`;

SET FOREIGN_KEY_CHECKS = 0;

-- Drop all existing tables
DROP TABLE IF EXISTS `fitton_has_item`;
DROP TABLE IF EXISTS `rental_has_item`;
DROP TABLE IF EXISTS `rental`;
DROP TABLE IF EXISTS `leave_day`;
DROP TABLE IF EXISTS `leave_plan`;
DROP TABLE IF EXISTS `employee_perm_leave`;
DROP TABLE IF EXISTS `handover`;
DROP TABLE IF EXISTS `pickup`;
DROP TABLE IF EXISTS `fitton`;
DROP TABLE IF EXISTS `payment`;
DROP TABLE IF EXISTS `appointment_has_service_package`;
DROP TABLE IF EXISTS `appointment`;
DROP TABLE IF EXISTS `service_package_price`;
DROP TABLE IF EXISTS `service_price`;
DROP TABLE IF EXISTS `service_package_has_service`;
DROP TABLE IF EXISTS `service_package`;
DROP TABLE IF EXISTS `service`;
DROP TABLE IF EXISTS `item`;
DROP TABLE IF EXISTS `user_has_role`;
DROP TABLE IF EXISTS `privilage`;
DROP TABLE IF EXISTS `user`;
DROP TABLE IF EXISTS `employee`;
DROP TABLE IF EXISTS `customer`;
DROP TABLE IF EXISTS `role`;
DROP TABLE IF EXISTS `module`;

-- Drop old lookup tables (may not exist if already dropped)
DROP TABLE IF EXISTS `designation`;
DROP TABLE IF EXISTS `employee_status`;
DROP TABLE IF EXISTS `item_category`;
DROP TABLE IF EXISTS `item_size`;
DROP TABLE IF EXISTS `item_status`;
DROP TABLE IF EXISTS `service_category`;
DROP TABLE IF EXISTS `service_status`;
DROP TABLE IF EXISTS `appointment_status`;
DROP TABLE IF EXISTS `booking_method`;
DROP TABLE IF EXISTS `payment_method`;
DROP TABLE IF EXISTS `rental_status`;
DROP TABLE IF EXISTS `pickup_status`;
DROP TABLE IF EXISTS `fitton_status`;
DROP TABLE IF EXISTS `handover_status`;
DROP TABLE IF EXISTS `item_condition`;
DROP TABLE IF EXISTS `service_package_status`;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- AUTH TABLES (3)
-- ============================================================

CREATE TABLE `role` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `module` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `privilage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `priv_insert` tinyint NOT NULL,
  `priv_select` tinyint NOT NULL,
  `priv_update` tinyint NOT NULL,
  `priv_delete` tinyint NOT NULL,
  `module_id` int NOT NULL,
  `role_id` int unsigned NOT NULL,
  `addeddatetime` datetime NOT NULL,
  `updatedatetime` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `fk_privilage_module1_idx` (`module_id`),
  KEY `fk_privilage_role1_idx` (`role_id`),
  CONSTRAINT `fk_privilage_module1` FOREIGN KEY (`module_id`) REFERENCES `module` (`id`),
  CONSTRAINT `fk_privilage_role1` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- ============================================================
-- CORE BUSINESS TABLES (6)
-- ============================================================

CREATE TABLE `customer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customercode` char(10) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `mobile` varchar(15) DEFAULT NULL,
  `email` varchar(255) NULL,
  `address` text NOT NULL,
  `note` text,
  `addeddatetime` datetime NOT NULL,
  `updateddatetime` datetime DEFAULT NULL,
  `deletedatetime` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `mobile_UNIQUE` (`mobile`),
  UNIQUE KEY `customercode_UNIQUE` (`customercode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `employee` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empno` char(10) NOT NULL,
  `fullname` varchar(250) NOT NULL,
  `callingname` varchar(45) NOT NULL,
  `nic` varchar(12) NOT NULL,
  `mobile` varchar(15) DEFAULT NULL,
  `dob` date NOT NULL,
  `address` text NOT NULL,
  `email` varchar(250) NOT NULL,
  `addeddatetime` datetime DEFAULT NULL,
  `updateddatetime` datetime DEFAULT NULL,
  `deletedatetime` datetime DEFAULT NULL,
  `designation` varchar(50) NOT NULL,
  `employee_status` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `number_UNIQUE` (`empno`),
  UNIQUE KEY `nic_UNIQUE` (`nic`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `mobile_UNIQUE` (`mobile`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `status` tinyint NOT NULL,
  `note` text,
  `addeddatetime` datetime NOT NULL,
  `updateddatetime` datetime DEFAULT NULL,
  `deletedatetime` datetime DEFAULT NULL,
  `employee_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idr_UNIQUE` (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  KEY `fk_user_employee1_idx` (`employee_id`),
  CONSTRAINT `fk_user_employee1` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `user_has_role` (
  `user_id` int NOT NULL,
  `role_id` int unsigned NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `fk_user_has_role_role1_idx` (`role_id`),
  CONSTRAINT `fk_user_has_role_role1` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`),
  CONSTRAINT `fk_user_has_role_user1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `item` (
  `id` int NOT NULL AUTO_INCREMENT,
  `itemcode` varchar(10) DEFAULT NULL,
  `item_name` varchar(200) NOT NULL,
  `note` text,
  `addeddatetime` datetime DEFAULT NULL,
  `updateddatetime` datetime DEFAULT NULL,
  `deletedatetime` datetime DEFAULT NULL,
  `item_category` varchar(50) NOT NULL,
  `item_status` varchar(50) NOT NULL,
`item_size` varchar(50) NOT NULL,
`rental_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `key_money` decimal(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `itemcode_UNIQUE` (`itemcode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `service` (
  `id` int NOT NULL AUTO_INCREMENT,
  `servicecode` char(10) NOT NULL,
  `name` varchar(255) NOT NULL,
  `duration` decimal(10,2) NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `description` text,
  `addeddatetime` datetime DEFAULT NULL,
  `updateddatetime` datetime DEFAULT NULL,
  `deletedatetime` datetime DEFAULT NULL,
  `deleteuser_id` int DEFAULT NULL,
  `updateuser_id` int DEFAULT NULL,
  `addeduser_id` int DEFAULT NULL,
  `service_category` varchar(50) NOT NULL,
  `service_status` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `servicecode_UNIQUE` (`servicecode`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `service_package` (
  `id` int NOT NULL AUTO_INCREMENT,
  `package_name` varchar(45) NOT NULL,
  `default_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `duration` decimal(10,2) DEFAULT NULL,
  `notes` text,
  `addeddatetime` datetime DEFAULT NULL,
  `updateddatetime` datetime DEFAULT NULL,
  `deletedatetime` datetime DEFAULT NULL,
  `addeduser_id` int DEFAULT NULL,
  `updateuser_id` int DEFAULT NULL,
  `deleteuser_id` int DEFAULT NULL,
  `service_package_status` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `package_name_UNIQUE` (`package_name`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- ============================================================
-- JUNCTION TABLES
-- ============================================================

CREATE TABLE `service_package_has_service` (
  `service_package_id` int NOT NULL,
  `service_id` int NOT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  KEY `fk_service_package_has_service_service1_idx` (`service_id`),
  KEY `fk_service_package_has_service_service_package1_idx` (`service_package_id`),
  CONSTRAINT `fk_service_package_has_service_service1` FOREIGN KEY (`service_id`) REFERENCES `service` (`id`),
  CONSTRAINT `fk_service_package_has_service_service_package1` FOREIGN KEY (`service_package_id`) REFERENCES `service_package` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- ============================================================
-- PRICING TABLES (2)
-- ============================================================

CREATE TABLE `service_package_price` (
  `id` int NOT NULL AUTO_INCREMENT,
  `price` decimal(10,2) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `addeddatetime` datetime NOT NULL,
  `updateddatetime` datetime DEFAULT NULL,
  `deletedatetime` datetime DEFAULT NULL,
  `addeduser_id` int NOT NULL,
  `updateuser_id` int DEFAULT NULL,
  `deleteuser_id` int DEFAULT NULL,
  `service_package_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `fk_service_package_price_service_package1_idx` (`service_package_id`),
  CONSTRAINT `fk_service_package_price_service_package1` FOREIGN KEY (`service_package_id`) REFERENCES `service_package` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- ============================================================
-- TRANSACTION TABLES (8)
-- ============================================================

CREATE TABLE `appointment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointment_no` char(8) NOT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `duration` decimal(10,2) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `note` text,
  `addeddatetime` datetime DEFAULT NULL,
  `updatedatetime` datetime DEFAULT NULL,
  `deletedatetime` datetime DEFAULT NULL,
  `appointment_status` varchar(50) NOT NULL,
  `booking_method` varchar(50) NOT NULL,
  `employee_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `appointment_no_UNIQUE` (`appointment_no`),
  KEY `fk_appointment_employee1_idx` (`employee_id`),
  CONSTRAINT `fk_appointment_employee1` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `appointment_has_service_package` (
  `appointment_id` int NOT NULL,
  `service_package_id` int NOT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `service_package_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_appointment_has_service_package_service_package1_idx` (`service_package_id`),
  KEY `fk_appointment_has_service_package_appointment1_idx` (`appointment_id`),
  CONSTRAINT `fk_appointment_has_service_package_appointment1` FOREIGN KEY (`appointment_id`) REFERENCES `appointment` (`id`),
  CONSTRAINT `fk_appointment_has_service_package_service_package1` FOREIGN KEY (`service_package_id`) REFERENCES `service_package` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `rental` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rent_no` char(6) NOT NULL,
  `appointment_date` date NOT NULL,
  `function_date` date DEFAULT NULL,
  `fitton_date` date NOT NULL,
  `pickup_date` date NOT NULL,
  `return_date` date NOT NULL,
  `keymoney` decimal(10,2) NOT NULL,
  `total_charge` decimal(10,2) NOT NULL,
  `advance` decimal(10,2) NOT NULL,
  `note` text,
  `addeddatetime` datetime NOT NULL,
  `updatedatetime` datetime DEFAULT NULL,
  `deletedatetime` datetime DEFAULT NULL,
  `rental_status` varchar(50) NOT NULL,
  `customer_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `rent_no` (`rent_no`),
  KEY `fk_rental_customer1_idx` (`customer_id`),
  CONSTRAINT `fk_rental_customer1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `rental_has_item` (
  `rental_id` int NOT NULL,
  `item_id` int NOT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `alteration_required` tinyint DEFAULT NULL,
  `alteration_note` text,
  `item_price` decimal(10,2) NOT NULL,
  `key_money` decimal(10,2) NOT NULL,
  `is_pickup` tinyint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `fk_rental_has_item_item1_idx` (`item_id`),
  KEY `fk_rental_has_item_rental1_idx` (`rental_id`),
  CONSTRAINT `fk_rental_has_item_item1` FOREIGN KEY (`item_id`) REFERENCES `item` (`id`),
  CONSTRAINT `fk_rental_has_item_rental1` FOREIGN KEY (`rental_id`) REFERENCES `rental` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `payment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bill_no` char(8) NOT NULL,
  `appointment_amount` decimal(10,2) NOT NULL,
  `pay_amount` decimal(10,2) NOT NULL,
  `paybalance_amount` decimal(10,2) NOT NULL,
  `note` text,
  `addeddatetime` datetime NOT NULL,
  `addeduser_id` int NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `appointment_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `bill_no_UNIQUE` (`bill_no`),
  KEY `fk_payment_appointment1_idx` (`appointment_id`),
  CONSTRAINT `fk_payment_appointment1` FOREIGN KEY (`appointment_id`) REFERENCES `appointment` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `pickup` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pickup_person` varchar(45) DEFAULT NULL,
  `contact_no` varchar(45) DEFAULT NULL,
  `schedulepickup_date` date DEFAULT NULL,
  `actualpickupdateandtime` datetime NULL,
  `addeddatetime` datetime DEFAULT NULL,
  `deletedatetime` datetime DEFAULT NULL,
  `updatedatetime` datetime DEFAULT NULL,
  `addeduser_id` int DEFAULT NULL,
  `deleteuser_id` int DEFAULT NULL,
  `updateuser_id` int DEFAULT NULL,
  `pickup_status` varchar(50) NOT NULL,
  `rental_id` int NOT NULL,
  PRIMARY KEY (`id`),
UNIQUE KEY `id_UNIQUE` (`id`),
KEY `fk_pickup_rental1_idx` (`rental_id`),
CONSTRAINT `fk_pickup_rental1`
FOREIGN KEY (`rental_id`)
REFERENCES `rental` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `fitton` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fitton_date` date NOT NULL,
  `addeduser_id` int DEFAULT NULL,
  `updateuser_id` int DEFAULT NULL,
  `deleteuser_id` int DEFAULT NULL,
  `addeddatetime` datetime NOT NULL,
  `updatedatetime` datetime DEFAULT NULL,
  `deletedatetime` datetime DEFAULT NULL,
  `fitton_status` varchar(50) NOT NULL,
  `rental_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `fk_fitton_rental1_idx` (`rental_id`),
  CONSTRAINT `fk_fitton_rental1` FOREIGN KEY (`rental_id`) REFERENCES `rental` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `fitton_has_item` (
  `fitton_id` int NOT NULL,
  `item_id` int NOT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `alteration_required` tinyint DEFAULT NULL,
  `alteration_note` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `fk_fitton_has_item_item1_idx` (`item_id`),
  KEY `fk_fitton_has_item_fitton1_idx` (`fitton_id`),
  CONSTRAINT `fk_fitton_has_item_fitton1` FOREIGN KEY (`fitton_id`) REFERENCES `fitton` (`id`),
  CONSTRAINT `fk_fitton_has_item_item1` FOREIGN KEY (`item_id`) REFERENCES `item` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `handover` (
  `id` int NOT NULL AUTO_INCREMENT,
  `actual_return_date` date NOT NULL,
  `actual_return_time` time NOT NULL,
  `return_person` varchar(45) DEFAULT NULL,
  `damage_charge` decimal(10,2) NOT NULL,
  `cleaning_charge` decimal(10,2) DEFAULT NULL,
  `late_return_fee` decimal(10,2) DEFAULT NULL,
  `total_refund` decimal(10,2) DEFAULT NULL,
  `damage_description` text,
  `return_note` text,
  `handover_status` varchar(50) NOT NULL,
  `item_condition` varchar(50) NOT NULL,
  `rental_id` int NOT NULL,
  `addeddatetime` datetime NOT NULL,
  `updatedatetime` datetime DEFAULT NULL,
  `deletedatetime` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_handover_rental1_idx` (`rental_id`),
  CONSTRAINT `fk_handover_rental1` FOREIGN KEY (`rental_id`) REFERENCES `rental` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `leave_plan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `month_year` char(7) NOT NULL,
  `employee_id` int NOT NULL,
  `addeddatetime` datetime NOT NULL,
  `updatedatetime` datetime DEFAULT NULL,
  `deletedatetime` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `fk_leave_plan_employee1_idx` (`employee_id`),
  CONSTRAINT `fk_leave_plan_employee1` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `leave_day` (
  `id` int NOT NULL AUTO_INCREMENT,
  `leave_date` date NOT NULL,
  `leave_type` varchar(45) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `leave_plan_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `fk_leave_day_leave_plan1_idx` (`leave_plan_id`),
  CONSTRAINT `fk_leave_day_leave_plan1` FOREIGN KEY (`leave_plan_id`) REFERENCES `leave_plan` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

CREATE TABLE `employee_perm_leave` (
  `id` int NOT NULL AUTO_INCREMENT,
  `day_of_week` varchar(45) NOT NULL,
  `employee_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `day_of_week_UNIQUE` (`day_of_week`),
  KEY `fk_permenet_leave_employee1_idx` (`employee_id`),
  CONSTRAINT `fk_permenet_leave_employee1` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
