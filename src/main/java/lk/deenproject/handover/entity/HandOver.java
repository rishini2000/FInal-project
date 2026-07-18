package lk.deenproject.handover.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

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
import lk.deenproject.enums.HandOverStatus;
import lk.deenproject.enums.ItemCondition;
import lk.deenproject.rental.entity.Rental;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "handover")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class HandOver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private LocalDate actual_return_date;
    private LocalTime actual_return_time;
    private String return_person;

    private BigDecimal damage_charge;
    private BigDecimal cleaning_charge;
    private BigDecimal late_return_fee;
    private BigDecimal total_refund;

    private String damage_description;
    private String return_note;

    @Column(name = "addeddatetime")
    private LocalDateTime addeddatetime;
    @Column(name = "updatedatetime")
    private LocalDateTime updatedatetime;
    @Column(name = "deletedatetime")
    private LocalDateTime deletedatetime;

    @Enumerated(EnumType.STRING)
    @Column(name = "handover_status")
    private HandOverStatus handoverStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_condition")
    private ItemCondition itemCondition;

    @ManyToOne
    @JoinColumn(name = "rental_id", referencedColumnName = "id")
    private Rental rental_id;

}
