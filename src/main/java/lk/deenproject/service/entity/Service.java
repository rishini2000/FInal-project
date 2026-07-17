package lk.deenproject.service.entity;

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
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lk.deenproject.enums.ServiceCategory;
import lk.deenproject.enums.ServiceStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "service")
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String servicecode;
    @NotBlank @Size(min = 2, max = 100)
    private String name;
    private BigDecimal duration;
    private BigDecimal price;
    private String description;

    private LocalDateTime addeddatetime;
    private LocalDateTime updateddatetime;
    private LocalDateTime deletedatetime;

    private Integer deleteuser_id;
    private Integer updateuser_id;
    private Integer addeduser_id;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(name = "service_status")
    private ServiceStatus serviceStatus;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(name = "service_category")
    private ServiceCategory serviceCategory;
}
