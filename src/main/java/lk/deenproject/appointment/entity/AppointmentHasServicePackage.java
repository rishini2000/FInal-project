package lk.deenproject.appointment.entity;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lk.deenproject.service_package.entity.ServicePackage;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "appointment_has_service_package")

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentHasServicePackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private BigDecimal service_package_price;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "appointment_id", referencedColumnName = "id")
    private Appointment appointment_id;

    @ManyToOne
    @JoinColumn(name = "service_package_id", referencedColumnName = "id")
    private ServicePackage service_package_id;

}
