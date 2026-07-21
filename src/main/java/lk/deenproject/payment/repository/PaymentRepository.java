package lk.deenproject.payment.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import lk.deenproject.payment.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query("SELECT p FROM Payment p WHERE p.bill_no = :billNo")
    Payment getByBillNo(String billNo);

    @Query("SELECT COALESCE(SUM(p.pay_amount), 0) FROM Payment p WHERE p.appointment_id.id = :appointmentId")
    BigDecimal getTotalPaidByAppointmentId(@Param("appointmentId") Integer appointmentId);

    @Query("SELECT p FROM Payment p WHERE p.appointment_id.id = :appointmentId")
    List<Payment> findByAppointmentId(@Param("appointmentId") Integer appointmentId);

}
