package lk.deenproject.User.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import lk.deenproject.User.Entity.Role;
import lk.deenproject.User.Repository.RoleRepository;
import lk.deenproject.common.BaseController;

@RestController
public class RoleController extends BaseController<Role, Integer> {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    protected RoleRepository getRepository() {
        return roleRepository;
    }

    @Override
    protected String getEntityName() {
        return "role";
    }

    @PreAuthorize("hasAuthority('USER_SELECT') or hasAuthority('PRIVILAGE_SELECT')")
    @GetMapping(value = "/role/alldatawithoutadmin", produces = "application/json")
    public List<Role> getAllRolesWithoutAdmin() {
        return roleRepository.getAllDatawithoutAdmin();
    }

    @PreAuthorize("hasAuthority('USER_SELECT')")
    @GetMapping(value = "/role/byuser/{userid}", produces = "application/json")
    public List<Role> getRolesByUserId(@PathVariable(name = "userid") Integer userid) {
        return roleRepository.getRolesByUserId(userid);
    }
}
