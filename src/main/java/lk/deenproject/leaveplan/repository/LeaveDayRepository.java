package lk.deenproject.leaveplan.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import lk.deenproject.leaveplan.entity.LeaveDay;

public interface LeaveDayRepository extends JpaRepository<LeaveDay, Integer>{

}
