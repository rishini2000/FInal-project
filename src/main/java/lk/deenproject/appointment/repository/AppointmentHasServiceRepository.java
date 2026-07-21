package lk.deenproject.appointment.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import lk.deenproject.appointment.entity.AppointmentHasService;

@Repository
public interface AppointmentHasServiceRepository extends JpaRepository<AppointmentHasService, Integer> {

    @Query("SELECT ahs FROM AppointmentHasService ahs WHERE ahs.appointment_id.id = :appointmentId")
    List<AppointmentHasService> findByAppointmentId(@Param("appointmentId") Integer appointmentId);

    @Transactional
    @Modifying
    @Query("DELETE FROM AppointmentHasService ahs WHERE ahs.appointment_id.id = :appointmentId AND ahs.service_id.id = :serviceId")
    void deleteByAppointmentIdAndServiceId(@Param("appointmentId") Integer appointmentId, @Param("serviceId") Integer serviceId);
}
