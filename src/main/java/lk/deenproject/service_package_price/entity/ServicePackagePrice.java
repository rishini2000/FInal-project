package lk.deenproject.service_package_price.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;


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
@Table(name = "service_package_price")

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ServicePackagePrice {
    
    @Id//pk
    @GeneratedValue(strategy = GenerationType.IDENTITY) //auto increment
    private Integer id ;

    private BigDecimal price;

    private LocalDate startDate;
    private LocalDate endDate;

    private LocalDateTime addeddatetime;
    private LocalDateTime updateddatetime;
    private LocalDateTime deletedatetime;
    
    private Integer addeduser_id;
    private Integer updateuser_id;
    private Integer deleteuser_id;

    @ManyToOne
    @JoinColumn(name = "service_package_id", referencedColumnName = "id")
    private ServicePackage service_package_id;
   


}
