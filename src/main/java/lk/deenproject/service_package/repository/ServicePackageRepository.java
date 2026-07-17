package lk.deenproject.service_package.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.deenproject.service_package.entity.ServicePackage;

public interface ServicePackageRepository extends JpaRepository<ServicePackage, Integer> {


    @Query("SELECT sp FROM ServicePackage sp WHERE sp.package_name=:package_name")
    ServicePackage findByName(String package_name);

}
