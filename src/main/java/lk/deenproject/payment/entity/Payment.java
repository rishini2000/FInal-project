package lk.deenproject.payment.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lk.deenproject.appointment.entity.Appointment;
import lk.deenproject.enums.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "payment")
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String bill_no;
    @NotNull @PositiveOrZero
    private BigDecimal appointment_amount;
    @NotNull @PositiveOrZero
    private BigDecimal pay_amount;
    private BigDecimal paybalance_amount;
    private String note;

    private LocalDateTime addeddatetime;
    private Integer addeduser_id;

    @ManyToOne
    @NotNull
    @JoinColumn(name = "appointment_id", referencedColumnName = "id")
    private Appointment appointment_id;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;
}
