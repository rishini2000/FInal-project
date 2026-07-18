package lk.deenproject.pickup.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lk.deenproject.enums.PickUpStatus;
import lk.deenproject.rental.entity.Rental;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pickup")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PickUp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String pickup_person;
    private String contact_no;
    private LocalDate schedulepickup_date;
    private LocalDateTime actualpickupdateandtime;
    
    private LocalDateTime addeddatetime;
    private LocalDateTime deletedatetime;
    private LocalDateTime updatedatetime;

    private Integer addeduser_id;
    private Integer deleteuser_id;
    private Integer updateuser_id;

    @Enumerated(EnumType.STRING)
    @Column(name = "pickup_status")
    private PickUpStatus pickupStatus;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rental_id", referencedColumnName = "id")
    private Rental rental_id;
}
