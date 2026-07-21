package lk.deenproject.appointment.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "appointment_has_service")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentHasService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "service_price")
    private BigDecimal service_price;

    private LocalDateTime addeddatetime;
    private LocalDateTime updatedatetime;
    private LocalDateTime deletedatetime;

    @ManyToOne
    @JoinColumn(name = "appointment_id", referencedColumnName = "id")
    private Appointment appointment_id;

    @ManyToOne
    @JoinColumn(name = "service_id", referencedColumnName = "id")
    private lk.deenproject.service.entity.Service service_id;
}
