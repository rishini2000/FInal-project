package lk.deenproject.leaveplan.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import lk.deenproject.leaveplan.entity.LeavePlan;


public interface LeavePlanRepository extends JpaRepository<LeavePlan, Integer>{

}
