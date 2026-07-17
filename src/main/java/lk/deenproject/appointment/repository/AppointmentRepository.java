package lk.deenproject.appointment.repository;

import org.springframework.data.jpa.repository.JpaRepository;


import lk.deenproject.appointment.entity.Appointment;

public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {

    // @Query("SELECT a FROM Appointment a WHERE a.customer_name = ?1 AND a.appointment_no = ?2")
    // Appointment findByCustomerNameAndAppointmentDateTime(Object customer_name, String appointment_no);

}
