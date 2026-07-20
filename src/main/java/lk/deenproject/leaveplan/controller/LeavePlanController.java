package lk.deenproject.leaveplan.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lk.deenproject.common.BaseController;
import lk.deenproject.leaveplan.entity.LeaveDay;
import lk.deenproject.leaveplan.entity.LeavePlan;
import lk.deenproject.leaveplan.repository.LeaveDayRepository;
import lk.deenproject.leaveplan.repository.LeavePlanRepository;

@RestController
public class LeavePlanController extends BaseController<LeavePlan, Integer> {

    @Autowired
    private LeavePlanRepository leavePlanDao;

    @Autowired
    private LeaveDayRepository leaveDayDao;

    @Override
    protected LeavePlanRepository getRepository() {
        return leavePlanDao;
    }

    @Override
    protected String getEntityName() {
        return "leaveplan";
    }

    @RequestMapping("/leaveplan")
    public org.springframework.web.servlet.ModelAndView leavePlanPage() {
        return createPageView();
    }

    @PreAuthorize("hasAuthority('LEAVEPLAN_SELECT')")
    @GetMapping(value = "/leaveplan/alldata", produces = "application/json")
    public List<LeavePlan> getAllData() {
        return findAll();
    }

    @PreAuthorize("hasAuthority('LEAVEPLAN_INSERT')")
    @PostMapping(value = "/leaveplan/insert")
    public String saveData(@Valid @RequestBody LeavePlan leavePlan) {
        if (leavePlan.getId() != null && leavePlanDao.existsById(leavePlan.getId())) {
            return error("save", "Leave Plan with the same ID already exists.");
        }

        try {
            leavePlan.setAddeddatetime(LocalDateTime.now());
            LeavePlan savedPlan = leavePlanDao.save(leavePlan);
            for (String leaveDate : leavePlan.getLeaveDates()) {
                LeaveDay leaveDay = new LeaveDay();
                leaveDay.setLeave_date(LocalDate.parse(leaveDate));
                leaveDay.setLeave_type("FULLDAY");
                leaveDay.setStart_time(LocalTime.of(0, 0));
                leaveDay.setEnd_time(LocalTime.of(23, 59));
                leaveDay.setLeave_plan_id(savedPlan);
                leaveDayDao.save(leaveDay);
            }
            return success();
        } catch (Exception e) {
            return error("save", e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('LEAVEPLAN_UPDATE')")
    @PutMapping(value = "/leaveplan/update")
    public String updateData(@Valid @RequestBody LeavePlan leavePlan) {
        if (!leavePlanDao.existsById(leavePlan.getId())) {
            return error("update", "Leave Plan with the given ID does not exist.");
        }

        try {
            leavePlan.setUpdatedatetime(LocalDateTime.now());
            leavePlanDao.save(leavePlan);
            return success();
        } catch (Exception e) {
            return error("update", e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('LEAVEPLAN_DELETE')")
    @DeleteMapping(value = "/leaveplan/delete")
    public String deleteData(@RequestBody LeavePlan leavePlan) {
        if (!leavePlanDao.existsById(leavePlan.getId())) {
            return error("delete", "Leave Plan with the given ID does not exist.");
        }

try {

    // Delete all leave days belonging to this leave plan
    leaveDayDao.deleteLeaveDaysByLeavePlanId(leavePlan.getId());

    // Then delete the leave plan
    leavePlanDao.deleteById(leavePlan.getId());

    return success();

} catch (Exception e) {
    return error("delete", e.getMessage());
}
    }
}
