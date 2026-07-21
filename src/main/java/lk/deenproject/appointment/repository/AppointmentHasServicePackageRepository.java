package lk.deenproject.appointment.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import lk.deenproject.appointment.entity.AppointmentHasServicePackage;

@Repository
public interface AppointmentHasServicePackageRepository extends JpaRepository<AppointmentHasServicePackage, Integer> {

    @Query("SELECT ahsp FROM AppointmentHasServicePackage ahsp WHERE ahsp.appointment_id.id = :appointmentId")
    List<AppointmentHasServicePackage> findByAppointmentId(@Param("appointmentId") Integer appointmentId);

    @Transactional
    @Modifying
    @Query("DELETE FROM AppointmentHasServicePackage ahsp WHERE ahsp.appointment_id.id = :appointmentId AND ahsp.service_package_id.id = :servicePackageId")
    void deleteByAppointmentIdAndServicePackageId(@Param("appointmentId") Integer appointmentId, @Param("servicePackageId") Integer servicePackageId);
}
