package lk.deenproject.rental.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CascadeType;
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
import jakarta.validation.constraints.PositiveOrZero;
import lk.deenproject.customer.entity.Customer;
import lk.deenproject.enums.RentalStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rental")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Rental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String rent_no;

    private LocalDate appointment_date;
    private LocalDate function_date;
    private LocalDate fitton_date;
    private LocalDate pickup_date;
    private LocalDate return_date;

    @PositiveOrZero
    private BigDecimal keymoney;
    @PositiveOrZero
    private BigDecimal total_charge;
    @PositiveOrZero
    private BigDecimal advance;

    private String note;

    private LocalDateTime addeddatetime;
    private LocalDateTime updatedatetime;
    private LocalDateTime deletedatetime;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(name = "rental_status")
    private RentalStatus rentalStatus;

    @ManyToOne
    @NotNull
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    private Customer customer_id;

    @OneToMany(mappedBy = "rental_id", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RentalHasItem> rentalHasItemList;
}
