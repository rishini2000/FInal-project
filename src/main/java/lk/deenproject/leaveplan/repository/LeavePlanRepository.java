package lk.deenproject.leaveplan.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import lk.deenproject.leaveplan.entity.LeavePlan;

@Repository
public interface LeavePlanRepository extends JpaRepository<LeavePlan, Integer> {

    @Query("SELECT lp FROM LeavePlan lp WHERE lp.employee_id.id = :employeeId")
    List<LeavePlan> findByEmployeeId(@Param("employeeId") Integer employeeId);
}
