-- ============================================================
-- SALON DEEN - SAMPLE DATA FOR ACCEPTANCE TESTING
-- Run after db sql.sql and seed data
-- ============================================================

USE `sdb`;

-- ============================================================
-- TIER 1: Independent Lookup Tables (No FK dependencies)
-- ============================================================

-- Designations
INSERT IGNORE INTO `designation` (`name`) VALUES
('Hair Stylist'), ('Makeup Artist'), ('Bridal Consultant'), ('Nail Technician'), ('Receptionist');

-- Employee Status
INSERT IGNORE INTO `employee_status` (`name`) VALUES
('Active'), ('On Leave'), ('Resigned');

-- Item Categories
INSERT IGNORE INTO `item_category` (`name`) VALUES
('Wedding Dresses'), ('Accessories'), ('Jewelry'), ('Shoes');

-- Item Sizes
INSERT IGNORE INTO `item_size` (`name`) VALUES
('XS'), ('S'), ('M'), ('L'), ('XL');

-- Item Status
INSERT IGNORE INTO `item_status` (`name`) VALUES
('Available'), ('Rented'), ('Under Maintenance');

-- Service Categories
INSERT IGNORE INTO `service_category` (`name`) VALUES
('Hair'), ('Skin'), ('Bridal'), ('Nails');

-- Service Status
INSERT IGNORE INTO `service_status` (`name`) VALUES
('Active'), ('Inactive');

-- Appointment Status
INSERT IGNORE INTO `appointment_status` (`name`) VALUES
('Confirmed'), ('Pending'), ('Completed'), ('Cancelled');

-- Booking Methods
INSERT IGNORE INTO `booking_method` (`name`) VALUES
('Phone'), ('Walk-in'), ('Online');

-- Payment Methods
INSERT IGNORE INTO `payment_method` (`name`) VALUES
('Cash'), ('Card'), ('Bank Transfer');

-- Handover Status
INSERT IGNORE INTO `handover_status` (`name`) VALUES
('Returned'), ('Partial Return'), ('Pending');

-- Item Condition
INSERT IGNORE INTO `item_condition` (`name`) VALUES
('Good'), ('Damaged'), ('Lost');

-- Fitton Status
INSERT IGNORE INTO `fitton_status` (`name`) VALUES
('Scheduled'), ('Completed'), ('Cancelled');

-- Rental Status
INSERT IGNORE INTO `rental_status` (`name`) VALUES
('Active'), ('Completed'), ('Cancelled');

-- Pickup Status
INSERT IGNORE INTO `pickup_status` (`name`) VALUES
('Scheduled'), ('Picked Up'), ('Pending');

-- Service Package Status
INSERT IGNORE INTO `service_package_status` (`name`) VALUES
('Active'), ('Inactive');

-- Customers (8 records)
INSERT IGNORE INTO `customer` (`firstname`, `lastname`, `mobile`, `email`, `address`, `note`, `addeddatetime`) VALUES
('Kavindi', 'Perera', 771234567, 'kavindi.perera@email.com', '45 Galle Road, Colombo 03', 'Regular customer', NOW()),
('Nipun', 'Silva', 772345678, 'nipun.silva@email.com', '12 Kandy Road, Maharagama', NULL, NOW()),
('Hashini', 'Fernando', 773456789, 'hashini.fernando@email.com', '78 Main Street, Negombo', 'Prefers morning appointments', NOW()),
('Dinesh', 'Kumarasinghe', 774567890, 'dinesh.k@email.com', '23 Lake Road, Nuwara Eliya', NULL, NOW()),
('Amasha', 'Jayawardena', 775678901, 'amasha.j@email.com', '56 Temple Road, Kandy', 'VIP customer', NOW()),
('Ruwan', 'Bandara', 776789012, 'ruwan.b@email.com', '89 Beach Road, Mount Lavinia', NULL, NOW()),
('Sanduni', 'Wickramasinghe', 777890123, 'sanduni.w@email.com', '34 Station Road, Gampaha', 'Referred by Kavindi', NOW()),
('Tharindu', 'Gunasekara', 778901234, 'tharindu.g@email.com', '67 Hill Street, Ratnapura', NULL, NOW());


-- ============================================================
-- TIER 2: Core Entities (Depend on TIER 1)
-- ============================================================

-- Employees (6 records)
INSERT IGNORE INTO `employee` (`empno`, `fullname`, `callingname`, `nic`, `mobile`, `dob`, `address`, `email`, `addeddatetime`, `designation_id`, `employee_status_id`) VALUES
('EMP00001', 'Kasun Perera', 'Kasun', '956789123V', 711234567, '1995-06-15', '123 Main Street, Colombo', 'kasun@salondeen.lk', NOW(), 1, 1),
('EMP00002', 'Nadeesha Silva', 'Nadeesha', '923456789V', 712345678, '1992-03-22', '45 Lake Road, Kandy', 'nadeesha@salondeen.lk', NOW(), 2, 1),
('EMP00003', 'Dilshan Fernando', 'Dilshan', '887654321V', 713456789, '1988-11-08', '78 Temple Road, Galle', 'dilshan@salondeen.lk', NOW(), 1, 1),
('EMP00004', 'Madushi Jayawardena', 'Madushi', '961234567V', 714567890, '1996-07-30', '23 Beach Road, Negombo', 'madushi@salondeen.lk', NOW(), 3, 1),
('EMP00005', 'Ruwan Kumara', 'Ruwan', '901234567V', 715678901, '1990-01-15', '56 Station Road, Matara', 'ruwan@salondeen.lk', NOW(), 4, 2),
('EMP00006', 'Sanduni Perera', 'Sanduni', '945678123V', 716789012, '1994-09-12', '89 Hill Street, Jaffna', 'sanduni@salondeen.lk', NOW(), 5, 1);

-- Items (9 records)
INSERT IGNORE INTO `item` (`itemcode`, `item_name`, `note`, `addeddatetime`, `item_category`, `item_status`, `rental_price`, `item_size`) VALUES
('ITM10001', 'Classic White Wedding Gown', 'A-line silhouette with lace details', NOW(), 'Wedding Dresses', 'Available', 15000.00, 'M'),
('ITM10002', 'Vintage Lace Wedding Dress', 'Victorian-inspired with long sleeves', NOW(), 'Wedding Dresses', 'Available', 18000.00, 'S'),
('ITM10003', 'Crystal Tiara Set', 'Silver crystal tiara with matching earrings', NOW(), 'Accessories', 'Available', 3500.00, 'M'),
('ITM10004', 'Pearl Necklace Set', 'Freshwater pearl necklace with bracelet', NOW(), 'Jewelry', 'Available', 2500.00, 'M'),
('ITM10005', 'Bridal Shoes - Ivory Heels', 'Satin heels with pearl embellishments', NOW(), 'Shoes', 'Rented', 4000.00, 'S'),
('ITM10006', 'Flower Crown - Rose Gold', 'Artificial flowers with gold leaves', NOW(), 'Accessories', 'Available', 2000.00, 'M'),
('ITM10007', 'Diamond Stud Earrings', 'Cubic zirconia silver studs', NOW(), 'Jewelry', 'Available', 3000.00, 'M'),
('ITM10008', 'Embroidered Clutch Bag', 'Silk clutch with beadwork', NOW(), 'Accessories', 'Under Maintenance', 2500.00, 'M');

-- Services (10 records)
INSERT IGNORE INTO `service` (`servicecode`, `name`, `duration`, `price`, `description`, `addeddatetime`, `service_category_id`, `service_status_id`) VALUES
('SRV000001', 'Haircut & Styling', 45.00, 2500.00, 'Professional haircut with blow-dry styling', NOW(), 1, 1),
('SRV000002', 'Hair Coloring', 120.00, 5000.00, 'Full hair coloring with premium products', NOW(), 1, 1),
('SRV000003', 'Bridal Hair & Makeup', 180.00, 15000.00, 'Complete bridal look with trial session', NOW(), 3, 1),
('SRV000004', 'Facial Treatment', 60.00, 3500.00, 'Deep cleansing facial with moisturizing', NOW(), 2, 1),
('SRV000005', 'Manicure', 30.00, 1500.00, 'Classic manicure with nail polish', NOW(), 4, 1),
('SRV000006', 'Pedicure', 45.00, 2000.00, 'Spa pedicure with foot massage', NOW(), 4, 1),
('SRV000007', 'Hair Spa Treatment', 90.00, 4000.00, 'Deep conditioning hair spa', NOW(), 1, 1),
('SRV000008', 'Party Makeup', 60.00, 4500.00, 'Glamorous party makeup look', NOW(), 3, 1),
('SRV000009', 'Nail Art', 45.00, 2500.00, 'Creative nail art designs', NOW(), 4, 1),
('SRV000010', 'Skin Whitening Treatment', 75.00, 6000.00, 'Advanced skin brightening facial', NOW(), 2, 2);

-- Service Packages (4 records)
INSERT IGNORE INTO `service_package` (`package_name`, `duration`, `notes`, `addeddatetime`, `service_package_status_id`) VALUES
('Bridal Complete Package', 480.00, 'Full bridal preparation including hair, makeup, and nail art', NOW(), 1),
('Party Ready Package', 150.00, 'Quick party preparation with makeup and hair styling', NOW(), 1),
('Pamper Day Package', 240.00, 'Relaxation package with facial, manicure, and pedicure', NOW(), 1),
('Basic Grooming Package', 120.00, 'Haircut, manicure, and basic facial', NOW(), 1);


-- ============================================================
-- TIER 3: Pricing & Scheduling (Depend on TIER 2)
-- ============================================================

-- Service Package Prices (4 records)
INSERT IGNORE INTO `service_package_price` (`price`, `start_date`, `end_date`, `addeddatetime`, `addeduser_id`, `service_package_id`) VALUES
(25000.00, '2025-01-01', '2025-12-31', NOW(), 1, 1),
(8000.00, '2025-01-01', '2025-12-31', NOW(), 1, 2),
(10000.00, '2025-01-01', '2025-12-31', NOW(), 1, 3),
(5500.00, '2025-01-01', '2025-12-31', NOW(), 1, 4);

-- Service Package Has Service (12 records)
INSERT IGNORE INTO `service_package_has_service` (`service_package_id`, `service_id`) VALUES
(1, 3), (1, 5), (1, 9),   -- Bridal: Bridal Hair & Makeup, Manicure, Nail Art
(2, 1), (2, 8),            -- Party: Haircut & Styling, Party Makeup
(3, 4), (3, 5), (3, 6),   -- Pamper: Facial, Manicure, Pedicure
(4, 1), (4, 5), (4, 4);   -- Basic: Haircut, Manicure, Facial

-- Appointments (10 records - mix of past/future/various statuses)
INSERT IGNORE INTO `appointment` (`appointment_no`, `date`, `start_time`, `end_time`, `duration`, `price`, `note`, `addeddatetime`, `appointment_status_id`, `booking_method_id`, `employee_id`) VALUES
('APT00001', '2025-06-15', '09:00:00', '10:30:00', 90.00, 2500.00, 'Regular haircut', '2025-06-14 10:00:00', 3, 1, 1),
('APT00002', '2025-06-20', '10:00:00', '13:00:00', 180.00, 15000.00, 'Bridal trial session', '2025-06-18 14:00:00', 3, 2, 2),
('APT00003', '2025-06-25', '14:00:00', '16:00:00', 120.00, 5000.00, 'Hair coloring appointment', '2025-06-23 09:00:00', 3, 1, 1),
('APT00004', '2025-07-02', '11:00:00', '12:00:00', 60.00, 3500.00, 'Facial treatment', '2025-06-30 16:00:00', 3, 3, 3),
('APT00005', '2025-07-05', '09:00:00', '09:45:00', 45.00, 1500.00, 'Manicure session', '2025-07-03 11:00:00', 4, 2, 4),
('APT00006', '2025-07-14', '10:00:00', '11:00:00', 60.00, 4500.00, 'Party makeup for event', '2025-07-10 08:00:00', 1, 1, 2),
('APT00007', '2025-07-15', '14:00:00', '15:30:00', 90.00, 4000.00, 'Hair spa treatment', '2025-07-11 15:00:00', 1, 3, 1),
('APT00008', '2025-07-16', '09:00:00', '16:00:00', 480.00, 25000.00, 'Full bridal package', '2025-07-12 10:00:00', 2, 2, 2),
('APT00009', '2025-07-18', '11:00:00', '12:00:00', 60.00, 3500.00, 'Facial treatment', '2025-07-14 09:00:00', 2, 1, 3),
('APT00010', '2025-07-20', '15:00:00', '16:30:00', 90.00, 4000.00, 'Hair spa for wedding guest', '2025-07-15 12:00:00', 1, 3, 1);

-- Rentals (7 records)
INSERT IGNORE INTO `rental` (`rent_no`, `appointment_date`, `function_date`, `fitton_date`, `pickup_date`, `return_date`, `keymoney`, `total_charge`, `advance`, `note`, `addeddatetime`, `rental_status_id`, `customer_id`) VALUES
('RNT001', '2025-06-20', '2025-06-18', '2025-06-19', '2025-06-21', '2025-06-22', 50000.00, 15000.00, 10000.00, 'Wedding dress rental', '2025-06-15 10:00:00', 2, 1),
('RNT002', '2025-06-28', '2025-06-26', '2025-06-27', '2025-06-29', '2025-06-30', 15000.00, 5000.00, 3000.00, 'Tiara and jewelry set', '2025-06-22 11:00:00', 2, 3),
('RNT003', '2025-07-10', '2025-07-08', '2025-07-09', '2025-07-11', '2025-07-12', 40000.00, 12000.00, 8000.00, 'Vintage lace dress rental', '2025-07-02 15:00:00', 2, 5),
('RNT004', '2025-07-20', '2025-07-18', '2025-07-19', '2025-07-21', '2025-07-22', 8000.00, 3000.00, 2000.00, 'Bridal shoes rental', '2025-07-12 09:00:00', 1, 2),
('RNT005', '2025-07-25', '2025-07-23', '2025-07-24', '2025-07-26', '2025-07-27', 20000.00, 7000.00, 5000.00, 'Pearl necklace set', '2025-07-14 10:00:00', 1, 4),
('RNT006', '2025-08-01', '2025-07-30', '2025-07-31', '2025-08-02', '2025-08-03', 5000.00, 2000.00, 1500.00, 'Flower crown rental', '2025-07-15 14:00:00', 1, 7);

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


-- ============================================================
-- TIER 4: Transactions (Depend on TIER 3)
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

-- Payments (6 records - for completed appointments)
INSERT IGNORE INTO `payment` (`bill_no`, `appointment_amount`, `pay_amount`, `paybalance_amount`, `note`, `addeddatetime`, `addeduser_id`, `payment_method_id`, `appointment_id`) VALUES
('BIL00001', 2500.00, 2500.00, 0.00, 'Paid in full', '2025-06-15 11:00:00', 1, 1, 1),
('BIL00002', 15000.00, 15000.00, 0.00, 'Bridal trial - paid', '2025-06-20 14:00:00', 1, 2, 2),
('BIL00003', 5000.00, 5000.00, 0.00, 'Hair coloring payment', '2025-06-25 16:30:00', 1, 1, 3),
('BIL00004', 3500.00, 3500.00, 0.00, 'Facial treatment paid', '2025-07-02 12:30:00', 1, 3, 4),
('BIL00005', 8000.00, 6000.00, 2000.00, 'Partial payment - balance due', '2025-07-14 11:30:00', 1, 2, 6),
('BIL00006', 4000.00, 4000.00, 0.00, 'Hair spa paid', '2025-07-15 16:00:00', 1, 1, 7);

-- Fittons (4 records)
INSERT IGNORE INTO `fitton` (`fitton_date`, `addeddatetime`, `fitton_status_id`, `rental_id`) VALUES
('2025-06-18', '2025-06-15 10:00:00', 2, 1),
('2025-06-26', '2025-06-22 11:00:00', 2, 2),
('2025-07-08', '2025-07-02 15:00:00', 2, 3),
('2025-07-18', '2025-07-12 09:00:00', 1, 4);

-- Pickups (4 records)
INSERT IGNORE INTO `pickup` (`pickup_person`, `contact_no`, `schedulepickup_date`, `actualpickupdateandtime`, `addeddatetime`, `pickup_status_id`, `rental_id`) VALUES
('Kavindi Perera', '0771234567', '2025-06-19', '2025-06-19 10:00:00', '2025-06-15 10:00:00', 2, 1),
('Hashini Fernando', '0773456789', '2025-06-27', '2025-06-27 14:00:00', '2025-06-22 11:00:00', 2, 2),
('Amasha Jayawardena', '0775678901', '2025-07-09', '2025-07-09 09:30:00', '2025-07-02 15:00:00', 2, 3),
('Nipun Silva', '0772345678', '2025-07-19', '2025-07-19 11:00:00', '2025-07-12 09:00:00', 1, 4);

-- Handovers (3 records - for completed rentals, manual IDs)
INSERT IGNORE INTO `handover` (`id`, `actual_return_date`, `actual_return_time`, `return_person`, `damage_charge`, `cleaning_charge`, `late_return_free`, `total_refund`, `damadge_description`, `return_note`, `addeddatetime`, `handover_status_id`, `item_condition_id`, `rental_id`, `employee_id`) VALUES
(1, '2025-06-21', '15:00:00', 'Kavindi Perera', 0.00, 500.00, 0.00, 44500.00, NULL, 'Returned in good condition', '2025-06-21 15:00:00', 1, 1, 1, 6),
(2, '2025-06-29', '16:00:00', 'Hashini Fernando', 0.00, 0.00, 0.00, 15000.00, NULL, 'All items returned', '2025-06-29 16:00:00', 1, 1, 2, 6),
(3, '2025-07-11', '14:00:00', 'Amasha Jayawardena', 2000.00, 500.00, 0.00, 37500.00, 'Small tear on hem', 'Minor damage noted', '2025-07-11 14:00:00', 1, 2, 3, 6);

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

-- Leave Days (6 records)
INSERT IGNORE INTO `leave_day` (`leave_date`, `leave_type`, `start_time`, `end_time`, `leave_plan_id`) VALUES
('2025-07-06', 'Full Day', '09:00:00', '17:00:00', 1),
('2025-07-13', 'Full Day', '09:00:00', '17:00:00', 1),
('2025-07-07', 'Half Day', '09:00:00', '13:00:00', 2),
('2025-07-14', 'Full Day', '09:00:00', '17:00:00', 2),
('2025-07-09', 'Full Day', '09:00:00', '17:00:00', 3),
('2025-07-16', 'Half Day', '13:00:00', '17:00:00', 3);


-- ============================================================
-- TIER 5: Dependent (Depend on TIER 4)
-- ============================================================

-- Fitton Has Item (6 records)
INSERT IGNORE INTO `fitton_has_item` (`fitton_id`, `item_id`, `alteration_required`, `alteration_note`) VALUES
(1, 1, 0, NULL),
(1, 3, 0, NULL),
(2, 3, 0, NULL),
(2, 4, 0, NULL),
(3, 2, 1, 'Needs hem adjustment - 2 inches'),
(3, 6, 0, NULL);


-- ============================================================
-- ADDITIONAL USER ACCOUNTS
-- ============================================================

-- New Users (linked to employees)
INSERT IGNORE INTO `user` (`username`, `password`, `status`, `note`, `addeddatetime`, `employee_id`) VALUES
('manager', '$2b$10$foHxK604ADelHyDQziCjP.eGbsg9dYyfmm4arWVNXF8tus8cvIulG', 1, 'Salon Manager', NOW(), 2),
('stylist1', '$2b$10$SV7/a4TvJGObDzagn2spQOXYmKCrUk68uyKSqCyAfoTjNLgWPttAq', 1, 'Senior Hair Stylist', NOW(), 3),
('receptionist1', '$2b$10$2SFxVYeF9Oxdf/liDuIZu.YKooKT4f/mUyL6AxNTYrHNVRb23GZ5q', 1, 'Front Desk', NOW(), 6);

-- Assign roles to new users
INSERT IGNORE INTO `user_has_role` (`user_id`, `role_id`) VALUES
(2, 2),  -- manager -> Manager role
(3, 3),  -- stylist1 -> Stylist role
(4, 4);  -- receptionist1 -> Receptionist role
