package lk.deenproject.Privilage.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lk.deenproject.Privilage.Entity.Module;
import lk.deenproject.Privilage.Repository.ModuleRepository;
import lk.deenproject.common.BaseController;

@RestController
public class ModuleController extends BaseController<Module, Integer> {

    @Autowired
    private ModuleRepository moduleDao;

    @Override
    protected ModuleRepository getRepository() {
        return moduleDao;
    }

    @Override
    protected String getEntityName() {
        return "module";
    }

    @PreAuthorize("hasAuthority('PRIVALAGE_SELECT')")
    @GetMapping(value = "/module/alldata", produces = "application/json")
    public List<Module> getAllData() {
        return findAll();
    }
}
