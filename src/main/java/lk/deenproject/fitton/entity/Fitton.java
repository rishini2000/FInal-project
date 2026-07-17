package lk.deenproject.fitton.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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
import lk.deenproject.enums.FittonStatus;
import lk.deenproject.rental.entity.Rental;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "fitton")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Fitton {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private LocalDate fitton_date;


    private Integer addeduser_id;
    private Integer updateuser_id;
    private Integer deleteuser_id;

    private LocalDateTime addeddatetime;
    private LocalDateTime updatedatetime;
    private LocalDateTime deletedatetime;

    @Enumerated(EnumType.STRING)
    @Column(name = "fitton_status")
    private FittonStatus fittonStatus;

    @ManyToOne
    @JoinColumn(name = "rental_id", referencedColumnName = "id")
    private Rental rental_id;

    @OneToMany(mappedBy = "fitton_id", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FittonHasItem> fittonHasItemsList;
}
