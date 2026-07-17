package lk.deenproject.employee.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lk.deenproject.common.BaseController;
import lk.deenproject.employee.Entity.EmployeePermLeave;
import lk.deenproject.employee.Repository.EmployeePermLeaveRepository;

@RestController
public class EmployeePermLeaveController extends BaseController<EmployeePermLeave, Integer> {

    @Autowired
    private EmployeePermLeaveRepository employeePermLeaveDao;

    @Override
    protected EmployeePermLeaveRepository getRepository() {
        return employeePermLeaveDao;
    }

    @Override
    protected String getEntityName() {
        return "employeepermleave";
    }

    @PreAuthorize("hasAuthority('EMPLOYEE_SELECT')")
    @GetMapping(value = "/employeepermleave/alldata", produces = "application/json")
    public List<EmployeePermLeave> getAllData() {
        return findAll();
    }

    @PreAuthorize("hasAuthority('EMPLOYEE_SELECT')")
    @GetMapping(value = "/employeepermleave/byemployee", params = {"employeeid"}, produces = "application/json")
    public List<EmployeePermLeave> getByEmployee(
            @RequestParam("employeeid") Integer employeeid) {
        return employeePermLeaveDao.getByEmployee(employeeid);
    }
}
