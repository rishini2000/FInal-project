package lk.deenproject.customer.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.deenproject.customer.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    @Query(value = "SELECT c FROM Customer c WHERE c.mobile = :mobile")
    Customer getByMobile(String mobile);

    @Query(value = "SELECT c FROM Customer c WHERE c.email = :email")
    Customer getByEmail(String email);

}
