package lk.deenproject.appointment.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import lk.deenproject.appointment.entity.Appointment;
import lk.deenproject.enums.AppointmentStatus;

public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {

    @Query("SELECT a FROM Appointment a WHERE a.employee_id.id = :employeeId AND a.date BETWEEN :startDate AND :endDate AND a.appointmentStatus != :cancelledStatus")
    List<Appointment> findConflictingAppointments(
        @Param("employeeId") Integer employeeId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("cancelledStatus") AppointmentStatus cancelledStatus
    );

    @Query("SELECT a FROM Appointment a WHERE a.employee_id.id = :employeeId AND a.date = :date")
    List<Appointment> findByEmployeeIdAndDate(@Param("employeeId") Integer employeeId, @Param("date") LocalDate date);
}
