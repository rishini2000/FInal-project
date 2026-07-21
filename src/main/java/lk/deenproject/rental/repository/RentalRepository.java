package lk.deenproject.rental.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.deenproject.rental.entity.Rental;

public interface RentalRepository extends JpaRepository<Rental, Integer>{

@Query("SELECT r FROM Rental r WHERE r.deletedatetime IS NULL")
List<Rental> getActiveRentals();
   

}
