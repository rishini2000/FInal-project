package lk.deenproject.employee.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.deenproject.employee.Entity.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    // nic eka hariyata genarate karana function eka
    @Query(value = "SELECT e FROM Employee e WHERE e.nic=?1")
    Employee getByNic(String nic);

    // mobile no eka hariyata genarate karana function eka
    @Query(value = "SELECT e FROM Employee e WHERE e.mobile=?1")
    Employee getByMobile(String mobile);

    // email eka hariyata genarate karana function eka
    @Query(value = "SELECT e FROM Employee e WHERE e.email=?1")
    Employee getByEmail(String email);

@Query("SELECT new Employee(e.id, e.empno, e.fullname, e.nic, e.email, e.mobile, e.designation, e.employeeStatus, e.dob) " +
       "FROM Employee e " +
       "WHERE e.employeeStatus = lk.deenproject.enums.EmployeeStatus.ACTIVE")
List<Employee> getSelectedColumn();

    @Query(value = "SELECT e FROM Employee e WHERE e.designation = ?1")
    List<Employee> getByDesignation(String beautician);

    @Query(value = "SELECT e FROM Employee e WHERE e.employeeStatus = lk.deenproject.enums.EmployeeStatus.ACTIVE AND e.id NOT IN (SELECT u.employee_id.id FROM User u WHERE u.status = true)")
    List<Employee> getEmployeesWithoutUser();
}
