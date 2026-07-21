package lk.deenproject.leaveplan.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import lk.deenproject.leaveplan.entity.LeaveDay;

@Repository
public interface LeaveDayRepository extends JpaRepository<LeaveDay, Integer> {

    @Query("SELECT ld FROM LeaveDay ld WHERE ld.leave_plan_id.id = :leavePlanId")
    List<LeaveDay> findByLeavePlanId(@Param("leavePlanId") Integer leavePlanId);

    @Transactional
    @Modifying
    @Query("DELETE FROM LeaveDay ld WHERE ld.leave_plan_id.id = ?1")
    void deleteLeaveDaysByLeavePlanId(Integer leavePlanId);

}
