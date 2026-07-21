package lk.deenproject.employee.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.deenproject.employee.Entity.EmployeePermLeave;


public interface EmployeePermLeaveRepository extends JpaRepository<EmployeePermLeave, Integer>{

    @Query("select e from EmployeePermLeave e where e.employee_id.id=?1")
    List<EmployeePermLeave> getByEmployee(Integer empId);

}
