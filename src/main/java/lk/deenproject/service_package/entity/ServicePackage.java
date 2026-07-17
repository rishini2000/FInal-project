package lk.deenproject.service_package.entity;

import java.math.BigDecimal;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lk.deenproject.enums.ServicePackageStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "service_package")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ServicePackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String package_name;
    private BigDecimal default_price;
    private BigDecimal duration;
    private String notes;

    private LocalDateTime addeddatetime;
    private LocalDateTime updateddatetime;
    private LocalDateTime deletedatetime;

    private Integer addeduser_id;
    private Integer updateuser_id;
    private Integer deleteuser_id;

    @Enumerated(EnumType.STRING)
    @Column(name = "service_package_status")
    private ServicePackageStatus servicePackageStatus;

    @OneToMany(mappedBy = "service_package_id", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ServicePackageHasService> servicePackageHasServiceList;
}
