-- ============================================================
-- SALON DEEN - SAMPLE DATA (Enum-based)
-- Run after schema.sql
-- ============================================================

USE `sdb`;

-- ============================================================
-- TIER 0: Auth Tables
-- ============================================================

INSERT IGNORE INTO `role` (`id`, `name`) VALUES
(6, 'Admin'),
(7, 'Manager'),
(8, 'Stylist'),
(9, 'Receptionist');

INSERT IGNORE INTO `module` (`id`, `name`) VALUES
(10, 'EMPLOYEE'),
(11, 'CUSTOMER'),
(12, 'SERVICE'),
(13, 'SERVICE_PRICE'),
(14, 'SERVICE_PACKAGE'),
(15, 'SERVICE_PACKAGE_PRICE'),
(16, 'APPOINTMENT'),
(17, 'LEAVEPLAN'),
(18, 'PAYMENT'),
(19, 'ITEM'),
(20, 'RENTAL'),
(22, 'FITTON'),
(23, 'PICKUP'),
(24, 'HANDOVER'),
(25, 'USER'),
(26, 'PRIVILAGE');

-- Admin privileges (full access to all modules)
INSERT IGNORE INTO `privilage` (`priv_insert`, `priv_select`, `priv_update`, `priv_delete`, `module_id`, `role_id`, `addeddatetime`) VALUES
(1, 1, 1, 1, 10, 6, NOW()),
(1, 1, 1, 1, 11, 6, NOW()),
(1, 1, 1, 1, 12, 6, NOW()),
(1, 1, 1, 1, 13, 6, NOW()),
(1, 1, 1, 1, 14, 6, NOW()),
(1, 1, 1, 1, 15, 6, NOW()),
(1, 1, 1, 1, 16, 6, NOW()),
(1, 1, 1, 1, 17, 6, NOW()),
(1, 1, 1, 1, 18, 6, NOW()),
(1, 1, 1, 1, 19, 6, NOW()),
(1, 1, 1, 1, 20, 6, NOW()),
(1, 1, 1, 1, 22, 6, NOW()),
(1, 1, 1, 1, 23, 6, NOW()),
(1, 1, 1, 1, 24, 6, NOW()),
(1, 1, 1, 1, 25, 6, NOW()),
(1, 1, 1, 1, 26, 6, NOW());

-- Manager privileges
INSERT IGNORE INTO `privilage` (`priv_insert`, `priv_select`, `priv_update`, `priv_delete`, `module_id`, `role_id`, `addeddatetime`) VALUES
(1, 1, 1, 0, 10, 7, NOW()),
(1, 1, 1, 0, 11, 7, NOW()),
(1, 1, 1, 0, 12, 7, NOW()),
(1, 1, 1, 0, 13, 7, NOW()),
(1, 1, 1, 0, 14, 7, NOW()),
(1, 1, 1, 0, 15, 7, NOW()),
(1, 1, 1, 0, 16, 7, NOW()),
(1, 1, 1, 0, 17, 7, NOW()),
(1, 1, 1, 0, 18, 7, NOW()),
(1, 1, 1, 0, 19, 7, NOW()),
(1, 1, 1, 0, 20, 7, NOW()),
(1, 1, 1, 0, 22, 7, NOW()),
(1, 1, 1, 0, 23, 7, NOW()),
(1, 1, 1, 0, 24, 7, NOW()),
(0, 1, 0, 0, 25, 7, NOW()),
(0, 1, 0, 0, 26, 7, NOW());

-- Stylist privileges
INSERT IGNORE INTO `privilage` (`priv_insert`, `priv_select`, `priv_update`, `priv_delete`, `module_id`, `role_id`, `addeddatetime`) VALUES
(0, 1, 0, 0, 10, 8, NOW()),
(0, 1, 0, 0, 11, 8, NOW()),
(0, 1, 0, 0, 12, 8, NOW()),
(0, 1, 0, 0, 16, 8, NOW()),
(0, 1, 0, 0, 17, 8, NOW());

-- Receptionist privileges
INSERT IGNORE INTO `privilage` (`priv_insert`, `priv_select`, `priv_update`, `priv_delete`, `module_id`, `role_id`, `addeddatetime`) VALUES
(1, 1, 1, 0, 11, 9, NOW()),
(1, 1, 1, 0, 16, 9, NOW()),
(1, 1, 1, 0, 18, 9, NOW()),
(0, 1, 0, 0, 10, 9, NOW()),
(0, 1, 0, 0, 12, 9, NOW()),
(0, 1, 0, 0, 20, 9, NOW());

-- ============================================================
-- TIER 1: Core Entities
-- ============================================================

-- Customers (8 records)
INSERT IGNORE INTO `customer` (`customercode`, `firstname`, `lastname`, `mobile`, `email`, `address`, `note`, `addeddatetime`) VALUES
('CUS00001', 'Kavindi', 'Perera', '0771234567', 'kavindi.perera@email.com', '45 Galle Road, Colombo 03', 'Regular customer', NOW()),
('CUS00002', 'Nipun', 'Silva', '0772345678', 'nipun.silva@email.com', '12 Kandy Road, Maharagama', NULL, NOW()),
('CUS00003', 'Hashini', 'Fernando', '0773456789', 'hashini.fernando@email.com', '78 Main Street, Negombo', 'Prefers morning appointments', NOW()),
('CUS00004', 'Dinesh', 'Kumarasinghe', '0774567890', 'dinesh.k@email.com', '23 Lake Road, Nuwara Eliya', NULL, NOW()),
('CUS00005', 'Amasha', 'Jayawardena', '0775678901', 'amasha.j@email.com', '56 Temple Road, Kandy', 'VIP customer', NOW()),
('CUS00006', 'Ruwan', 'Bandara', '0776789012', 'ruwan.b@email.com', '89 Beach Road, Mount Lavinia', NULL, NOW()),
('CUS00007', 'Sanduni', 'Wickramasinghe', '0777890123', 'sanduni.w@email.com', '34 Station Road, Gampaha', 'Referred by Kavindi', NOW()),
('CUS00008', 'Tharindu', 'Gunasekara', '0778901234', 'tharindu.g@email.com', '67 Hill Street, Ratnapura', NULL, NOW());

-- Employees (6 records)
INSERT IGNORE INTO `employee` (`empno`, `fullname`, `callingname`, `nic`, `mobile`, `dob`, `address`, `email`, `addeddatetime`, `designation`, `employee_status`) VALUES
('EMP00001', 'Kasun Perera', 'Kasun', '956789123V', '0711234567', '1995-06-15', '123 Main Street, Colombo', 'kasun@salondeen.lk', NOW(), 'HAIR_STYLIST', 'ACTIVE'),
('EMP00002', 'Nadeesha Silva', 'Nadeesha', '923456789V', '0712345678', '1992-03-22', '45 Lake Road, Kandy', 'nadeesha@salondeen.lk', NOW(), 'MAKEUP_ARTIST', 'ACTIVE'),
('EMP00003', 'Dilshan Fernando', 'Dilshan', '887654321V', '0713456789', '1988-11-08', '78 Temple Road, Galle', 'dilshan@salondeen.lk', NOW(), 'HAIR_STYLIST', 'ACTIVE'),
('EMP00004', 'Madushi Jayawardena', 'Madushi', '961234567V', '0714567890', '1996-07-30', '23 Beach Road, Negombo', 'madushi@salondeen.lk', NOW(), 'BRIDAL_CONSULTANT', 'ACTIVE'),
('EMP00005', 'Ruwan Kumara', 'Ruwan', '901234567V', '0715678901', '1990-01-15', '56 Station Road, Matara', 'ruwan@salondeen.lk', NOW(), 'NAIL_TECHNICIAN', 'ACTIVE'),
('EMP00006', 'Sanduni Perera', 'Sanduni', '945678123V', '0716789012', '1994-09-12', '89 Hill Street, Jaffna', 'sanduni@salondeen.lk', NOW(), 'RECEPTIONIST', 'ACTIVE');

-- Users
INSERT IGNORE INTO `user` (`username`, `password`, `status`, `note`, `addeddatetime`, `employee_id`) VALUES
('admin', '$2a$10$BUStGfbTdIPmHbm8u9scVem/g38hAUwa1vS6p2vVvWodZeJV7LdcG', 1, 'System Administrator', NOW(), 1),
('manager', '$2a$10$mS.9UkjWoodrEU5CgSKeN.EkHXyVINF5.Vi/sl.DiCz5jpmNwE.ku', 1, 'Salon Manager', NOW(), 2),
('stylist1', '$2a$10$IAwV7Qqx5h3ktfExLRT1dObwRVvBhqdQFggs9bADOY9dLu4ZMQKD6', 1, 'Senior Hair Stylist', NOW(), 3),
('receptionist1', '$2a$10$AMedQYu1NJBwf742yTgU9.9iuenryB6PT9sQXhcnb.oof52NkfQ2W', 1, 'Front Desk', NOW(), 6);

-- User Has Role
INSERT IGNORE INTO `user_has_role` (`user_id`, `role_id`) VALUES
(1, 6),
(2, 7),
(3, 8),
(4, 9);

-- Items (8 records)
INSERT IGNORE INTO `item` (`itemcode`, `item_name`, `note`, `addeddatetime`, `item_category`, `item_status`, `rental_price`, `item_size`) VALUES
('ITM10001', 'Classic White Wedding Gown', 'A-line silhouette with lace details', NOW(), 'WEDDING_DRESSES', 'AVAILABLE', 15000.00, 'M'),
('ITM10002', 'Vintage Lace Wedding Dress', 'Victorian-inspired with long sleeves', NOW(), 'WEDDING_DRESSES', 'AVAILABLE', 18000.00, 'S'),
('ITM10003', 'Crystal Tiara Set', 'Silver crystal tiara with matching earrings', NOW(), 'ACCESSORIES', 'AVAILABLE', 3500.00, 'M'),
('ITM10004', 'Pearl Necklace Set', 'Freshwater pearl necklace with bracelet', NOW(), 'JEWELRY', 'AVAILABLE', 2500.00, 'M'),
('ITM10005', 'Bridal Shoes - Ivory Heels', 'Satin heels with pearl embellishments', NOW(), 'SHOES', 'RENTED', 4000.00, 'S'),
('ITM10006', 'Flower Crown - Rose Gold', 'Artificial flowers with gold leaves', NOW(), 'ACCESSORIES', 'AVAILABLE', 2000.00, 'M'),
('ITM10007', 'Diamond Stud Earrings', 'Cubic zirconia silver studs', NOW(), 'JEWELRY', 'AVAILABLE', 3000.00, 'M'),
('ITM10008', 'Embroidered Clutch Bag', 'Silk clutch with beadwork', NOW(), 'ACCESSORIES', 'UNDER_MAINTENANCE', 2500.00, 'M');

-- Services (10 records)
INSERT IGNORE INTO `service` (`servicecode`, `name`, `duration`, `price`, `description`, `addeddatetime`, `service_category`, `service_status`) VALUES
('SRV000001', 'Haircut & Styling', 45.00, 2500.00, 'Professional haircut with blow-dry styling', NOW(), 'HAIR', 'ACTIVE'),
('SRV000002', 'Hair Coloring', 120.00, 5000.00, 'Full hair coloring with premium products', NOW(), 'HAIR', 'ACTIVE'),
('SRV000003', 'Bridal Hair & Makeup', 180.00, 15000.00, 'Complete bridal look with trial session', NOW(), 'BRIDAL', 'ACTIVE'),
('SRV000004', 'Facial Treatment', 60.00, 3500.00, 'Deep cleansing facial with moisturizing', NOW(), 'SKIN', 'ACTIVE'),
('SRV000005', 'Manicure', 30.00, 1500.00, 'Classic manicure with nail polish', NOW(), 'NAILS', 'ACTIVE'),
('SRV000006', 'Pedicure', 45.00, 2000.00, 'Spa pedicure with foot massage', NOW(), 'NAILS', 'ACTIVE'),
('SRV000007', 'Hair Spa Treatment', 90.00, 4000.00, 'Deep conditioning hair spa', NOW(), 'HAIR', 'ACTIVE'),
('SRV000008', 'Party Makeup', 60.00, 4500.00, 'Glamorous party makeup look', NOW(), 'BRIDAL', 'ACTIVE'),
('SRV000009', 'Nail Art', 45.00, 2500.00, 'Creative nail art designs', NOW(), 'NAILS', 'ACTIVE'),
('SRV000010', 'Skin Whitening Treatment', 75.00, 6000.00, 'Advanced skin brightening facial', NOW(), 'SKIN', 'INACTIVE');

-- Service Packages (4 records)
INSERT IGNORE INTO `service_package` (`package_name`, `default_price`, `duration`, `notes`, `addeddatetime`, `service_package_status`) VALUES
('Bridal Complete Package', 25000.00, 480.00, 'Full bridal preparation including hair, makeup, and nail art', NOW(), 'ACTIVE'),
('Party Ready Package', 8000.00, 150.00, 'Quick party preparation with makeup and hair styling', NOW(), 'ACTIVE'),
('Pamper Day Package', 10000.00, 240.00, 'Relaxation package with facial, manicure, and pedicure', NOW(), 'ACTIVE'),
('Basic Grooming Package', 5500.00, 120.00, 'Haircut, manicure, and basic facial', NOW(), 'ACTIVE');

-- ============================================================
-- TIER 2: Pricing & Scheduling
-- ============================================================

-- Service Package Prices (4 records)
INSERT IGNORE INTO `service_package_price` (`price`, `start_date`, `end_date`, `addeddatetime`, `addeduser_id`, `service_package_id`) VALUES
(25000.00, '2025-01-01', '2025-12-31', NOW(), 1, 1),
(8000.00, '2025-01-01', '2025-12-31', NOW(), 1, 2),
(10000.00, '2025-01-01', '2025-12-31', NOW(), 1, 3),
(5500.00, '2025-01-01', '2025-12-31', NOW(), 1, 4);

-- Service Package Has Service (12 records)
INSERT IGNORE INTO `service_package_has_service` (`service_package_id`, `service_id`) VALUES
(1, 3), (1, 5), (1, 9),
(2, 1), (2, 8),
(3, 4), (3, 5), (3, 6),
(4, 1), (4, 5), (4, 4);

-- Appointments (10 records)
INSERT IGNORE INTO `appointment` (`appointment_no`, `date`, `start_time`, `end_time`, `duration`, `price`, `note`, `addeddatetime`, `appointment_status`, `booking_method`, `employee_id`) VALUES
('APT00001', '2025-06-15', '09:00:00', '10:30:00', 90.00, 2500.00, 'Regular haircut', '2025-06-14 10:00:00', 'COMPLETED', 'PHONE', 1),
('APT00002', '2025-06-20', '10:00:00', '13:00:00', 180.00, 15000.00, 'Bridal trial session', '2025-06-18 14:00:00', 'COMPLETED', 'WALK_IN', 2),
('APT00003', '2025-06-25', '14:00:00', '16:00:00', 120.00, 5000.00, 'Hair coloring appointment', '2025-06-23 09:00:00', 'COMPLETED', 'PHONE', 1),
('APT00004', '2025-07-02', '11:00:00', '12:00:00', 60.00, 3500.00, 'Facial treatment', '2025-06-30 16:00:00', 'COMPLETED', 'ONLINE', 3),
('APT00005', '2025-07-05', '09:00:00', '09:45:00', 45.00, 1500.00, 'Manicure session', '2025-07-03 11:00:00', 'CANCELLED', 'WALK_IN', 4),
('APT00006', '2025-07-14', '10:00:00', '11:00:00', 60.00, 4500.00, 'Party makeup for event', '2025-07-10 08:00:00', 'CONFIRMED', 'PHONE', 2),
('APT00007', '2025-07-15', '14:00:00', '15:30:00', 90.00, 4000.00, 'Hair spa treatment', '2025-07-11 15:00:00', 'CONFIRMED', 'ONLINE', 1),
('APT00008', '2025-07-16', '09:00:00', '16:00:00', 480.00, 25000.00, 'Full bridal package', '2025-07-12 10:00:00', 'PENDING', 'WALK_IN', 2),
('APT00009', '2025-07-18', '11:00:00', '12:00:00', 60.00, 3500.00, 'Facial treatment', '2025-07-14 09:00:00', 'PENDING', 'PHONE', 3),
('APT00010', '2025-07-20', '15:00:00', '16:30:00', 90.00, 4000.00, 'Hair spa for wedding guest', '2025-07-15 12:00:00', 'CONFIRMED', 'ONLINE', 1);

-- Rentals (6 records)
INSERT IGNORE INTO `rental` (`rent_no`, `appointment_date`, `function_date`, `fitton_date`, `pickup_date`, `return_date`, `keymoney`, `total_charge`, `advance`, `note`, `addeddatetime`, `rental_status`, `customer_id`) VALUES
('RNT001', '2025-06-15', '2025-06-20', '2025-06-18', '2025-06-19', '2025-06-21', 50000.00, 15000.00, 10000.00, 'Wedding dress rental', '2025-06-15 10:00:00', 'COMPLETED', 1),
('RNT002', '2025-06-22', '2025-06-28', '2025-06-26', '2025-06-27', '2025-06-29', 15000.00, 5000.00, 3000.00, 'Tiara and jewelry set', '2025-06-22 11:00:00', 'COMPLETED', 3),
('RNT003', '2025-07-02', '2025-07-10', '2025-07-08', '2025-07-09', '2025-07-11', 40000.00, 12000.00, 8000.00, 'Vintage lace dress rental', '2025-07-02 15:00:00', 'COMPLETED', 5),
('RNT004', '2025-07-12', '2025-07-20', '2025-07-18', '2025-07-19', '2025-07-21', 8000.00, 3000.00, 2000.00, 'Bridal shoes rental', '2025-07-12 09:00:00', 'ACTIVE', 2),
('RNT005', '2025-07-14', '2025-07-25', '2025-07-23', '2025-07-24', '2025-07-26', 20000.00, 7000.00, 5000.00, 'Pearl necklace set', '2025-07-14 10:00:00', 'ACTIVE', 4),
('RNT006', '2025-07-15', '2025-08-01', '2025-07-30', '2025-07-31', '2025-08-02', 5000.00, 2000.00, 1500.00, 'Flower crown rental', '2025-07-15 14:00:00', 'ACTIVE', 7);

-- ============================================================
-- TIER 3: Transactions
-- ============================================================

-- Appointment Has Service Package (10 records)
INSERT IGNORE INTO `appointment_has_service_package` (`appointment_id`, `service_package_id`, `service_package_price`) VALUES
(1, 4, 5500.00),
(2, 1, 25000.00),
(3, 4, 5500.00),
(4, 3, 10000.00),
(5, 4, 5500.00),
(6, 2, 8000.00),
(7, 3, 10000.00),
(8, 1, 25000.00),
(9, 3, 10000.00),
(10, 3, 10000.00);

-- Payments (6 records)
INSERT IGNORE INTO `payment` (`bill_no`, `appointment_amount`, `pay_amount`, `paybalance_amount`, `note`, `addeddatetime`, `addeduser_id`, `payment_method`, `appointment_id`) VALUES
('BIL00001', 2500.00, 2500.00, 0.00, 'Paid in full', '2025-06-15 11:00:00', 1, 'CASH', 1),
('BIL00002', 15000.00, 15000.00, 0.00, 'Bridal trial - paid', '2025-06-20 14:00:00', 1, 'CARD', 2),
('BIL00003', 5000.00, 5000.00, 0.00, 'Hair coloring payment', '2025-06-25 16:30:00', 1, 'CASH', 3),
('BIL00004', 3500.00, 3500.00, 0.00, 'Facial treatment paid', '2025-07-02 12:30:00', 1, 'BANK_TRANSFER', 4),
('BIL00005', 8000.00, 6000.00, 2000.00, 'Partial payment - balance due', '2025-07-14 11:30:00', 1, 'CARD', 6),
('BIL00006', 4000.00, 4000.00, 0.00, 'Hair spa paid', '2025-07-15 16:00:00', 1, 'CASH', 7);

-- Fittons (4 records)
INSERT IGNORE INTO `fitton` (`fitton_date`, `addeddatetime`, `fitton_status`, `rental_id`) VALUES
('2025-06-18', '2025-06-15 10:00:00', 'COMPLETED', 1),
('2025-06-26', '2025-06-22 11:00:00', 'COMPLETED', 2),
('2025-07-08', '2025-07-02 15:00:00', 'COMPLETED', 3),
('2025-07-18', '2025-07-12 09:00:00', 'SCHEDULED', 4);

-- Pickups (4 records)
INSERT IGNORE INTO `pickup` (`pickup_person`, `contact_no`, `schedulepickup_date`, `actualpickupdateandtime`, `addeddatetime`, `pickup_status`, `rental_id`) VALUES
('Kavindi Perera', '0771234567', '2025-06-19', '2025-06-19 10:00:00', '2025-06-15 10:00:00', 'PICKED_UP', 1),
('Hashini Fernando', '0773456789', '2025-06-27', '2025-06-27 14:00:00', '2025-06-22 11:00:00', 'PICKED_UP', 2),
('Amasha Jayawardena', '0775678901', '2025-07-09', '2025-07-09 09:30:00', '2025-07-02 15:00:00', 'PICKED_UP', 3),
('Nipun Silva', '0772345678', '2025-07-19', '2025-07-19 11:00:00', '2025-07-12 09:00:00', 'SCHEDULED', 4);

-- Handovers (3 records)
INSERT IGNORE INTO `handover` (`actual_return_date`, `actual_return_time`, `return_person`, `damage_charge`, `cleaning_charge`, `late_return_fee`, `total_refund`, `damage_description`, `return_note`, `addeddatetime`, `handover_status`, `item_condition`, `rental_id`, `employee_id`) VALUES
('2025-06-21', '15:00:00', 'Kavindi Perera', 0.00, 500.00, 0.00, 44500.00, NULL, 'Returned in good condition', '2025-06-21 15:00:00', 'RETURNED', 'GOOD', 1, 6),
('2025-06-29', '16:00:00', 'Hashini Fernando', 0.00, 0.00, 0.00, 15000.00, NULL, 'All items returned', '2025-06-29 16:00:00', 'RETURNED', 'GOOD', 2, 6),
('2025-07-11', '14:00:00', 'Amasha Jayawardena', 2000.00, 500.00, 0.00, 37500.00, 'Small tear on hem', 'Minor damage noted', '2025-07-11 14:00:00', 'RETURNED', 'DAMAGED', 3, 6);

-- Rental Has Item (10 records)
INSERT IGNORE INTO `rental_has_item` (`rental_id`, `item_id`, `alteration_required`, `alteration_note`, `item_price`, `quantity`, `is_pickup`) VALUES
(1, 1, 0, NULL, 15000.00, 1, 1),
(1, 3, 0, NULL, 5000.00, 1, 1),
(2, 3, 0, NULL, 5000.00, 1, 1),
(2, 4, 0, NULL, 7000.00, 1, 1),
(3, 2, 1, 'Hem adjustment needed', 12000.00, 1, 1),
(3, 6, 0, NULL, 2000.00, 1, 1),
(4, 5, 0, NULL, 3000.00, 1, 0),
(5, 4, 0, NULL, 7000.00, 1, 0),
(6, 6, 0, NULL, 2000.00, 1, 0),
(6, 7, 0, NULL, 3500.00, 1, 0);

-- Leave Plans (3 records)
INSERT IGNORE INTO `leave_plan` (`month_year`, `employee_id`, `addeddatetime`) VALUES
('2025-07', 1, NOW()),
('2025-07', 3, NOW()),
('2025-07', 5, NOW());

-- Employee Permanent Leave (3 records)
INSERT IGNORE INTO `employee_perm_leave` (`day_of_week`, `employee_id`) VALUES
('Sunday', 1),
('Monday', 3),
('Wednesday', 5);

-- Leave Days (6 records)
INSERT IGNORE INTO `leave_day` (`leave_date`, `leave_type`, `start_time`, `end_time`, `leave_plan_id`) VALUES
('2025-07-06', 'Full Day', '09:00:00', '17:00:00', 1),
('2025-07-13', 'Full Day', '09:00:00', '17:00:00', 1),
('2025-07-07', 'Half Day', '09:00:00', '13:00:00', 2),
('2025-07-14', 'Full Day', '09:00:00', '17:00:00', 2),
('2025-07-09', 'Full Day', '09:00:00', '17:00:00', 3),
('2025-07-16', 'Half Day', '13:00:00', '17:00:00', 3);

-- Fitton Has Item (6 records)
INSERT IGNORE INTO `fitton_has_item` (`fitton_id`, `item_id`, `alteration_required`, `alteration_note`) VALUES
(1, 1, 0, NULL),
(1, 3, 0, NULL),
(2, 3, 0, NULL),
(2, 4, 0, NULL),
(3, 2, 1, 'Needs hem adjustment - 2 inches'),
(3, 6, 0, NULL);
