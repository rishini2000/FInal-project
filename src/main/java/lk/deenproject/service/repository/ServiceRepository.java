package lk.deenproject.service.repository;

import lk.deenproject.service.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ServiceRepository extends JpaRepository<Service, Integer> {

    @Query(value = "SELECT s FROM Service s WHERE s.servicecode = :servicecode")
    Service getByServicecode(String servicecode);

}
