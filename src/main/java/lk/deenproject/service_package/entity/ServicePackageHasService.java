package lk.deenproject.service_package.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lk.deenproject.service.entity.Service;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "service_package_has_service")

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ServicePackageHasService {

   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Integer id;



    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "service_package_id", referencedColumnName = "id")
    private ServicePackage service_package_id;
    
    
    @ManyToOne
    @JoinColumn(name = "service_id", referencedColumnName = "id")
    private Service service_id;

}
