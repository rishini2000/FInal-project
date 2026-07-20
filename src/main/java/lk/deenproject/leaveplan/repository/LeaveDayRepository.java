package lk.deenproject.leaveplan.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import lk.deenproject.leaveplan.entity.LeaveDay;

public interface LeaveDayRepository extends JpaRepository<LeaveDay, Integer> {

    @Transactional
    @Modifying
    @Query("DELETE FROM LeaveDay ld WHERE ld.leave_plan_id.id = ?1")
    void deleteLeaveDaysByLeavePlanId(Integer leavePlanId);

}