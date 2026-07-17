package lk.deenproject.appointment.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lk.deenproject.employee.Entity.Employee;
import lk.deenproject.enums.AppointmentStatus;
import lk.deenproject.enums.BookingMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "appointment")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String appointment_no;
    private LocalDate date;
    private LocalTime start_time;
    private LocalTime end_time;

    @Positive
    private BigDecimal duration;
    @PositiveOrZero
    private BigDecimal price;
    private String note;

    private LocalDateTime addeddatetime;
    private LocalDateTime updatedatetime;
    private LocalDateTime deletedatetime;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(name = "appointment_status")
    private AppointmentStatus appointmentStatus;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(name = "booking_method")
    private BookingMethod bookingMethod;

    @ManyToOne
    @NotNull
    @JoinColumn(name = "employee_id", referencedColumnName = "id")
    private Employee employee_id;

    @OneToMany(mappedBy = "appointment_id")
    private List<AppointmentHasServicePackage> appointmentHasServicePackageList;
}
