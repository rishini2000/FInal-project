package lk.deenproject.Privilage.Controller;

import java.time.LocalDateTime;
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
import lk.deenproject.Privilage.Entity.Privilage;
import lk.deenproject.Privilage.Repository.PrivilageRepository;

@RestController
public class PrivilageController extends BaseController<Privilage, Integer> {

    @Autowired
    private PrivilageRepository privilageDao;

    @Override
    protected PrivilageRepository getRepository() {
        return privilageDao;
    }

    @Override
    protected String getEntityName() {
        return "privilage";
    }

    @RequestMapping("/privilage")
    public org.springframework.web.servlet.ModelAndView privilagePage() {
        return createPageView();
    }

    @PreAuthorize("hasAuthority('PRIVILAGE_SELECT')")
    @GetMapping(value = "/privilage/alldata", produces = "application/json")
    public List<Privilage> getAllData() {
        return findAll();
    }

    @PreAuthorize("hasAuthority('PRIVILAGE_INSERT')")
    @PostMapping(value = "/privilage/insert")
    public String saveData(@Valid @RequestBody Privilage privilage) {
        Privilage existingPrivilageByRoleModule = privilageDao.getByRoleModule(privilage.getRole_id().getId(), privilage.getModule_id().getId());
        if (existingPrivilageByRoleModule != null) {
            return error("save", "Privilage already exists for the given role and module.");
        }

        try {
            privilage.setAddeddatetime(LocalDateTime.now());
            privilageDao.save(privilage);
            return success();
        } catch (Exception e) {
            return error("save", e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('PRIVILAGE_UPDATE')")
    @PutMapping(value = "/privilage/update")
    public String updateData(@Valid @RequestBody Privilage privilage) {
        Privilage existingPrivilage = privilageDao.getReferenceById(privilage.getId());
        if (existingPrivilage == null) {
            return error("update", "Privilage not found.");
        }

        try {
            privilage.setUpdatedatetime(LocalDateTime.now());
            privilageDao.save(privilage);
            return success();
        } catch (Exception e) {
            return error("update", e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('PRIVILAGE_DELETE')")
    @DeleteMapping(value = "/privilage/delete")
    public String deleteData(@RequestBody Privilage privilage) {
        Privilage existingPrivilage = privilageDao.getReferenceById(privilage.getId());
        if (existingPrivilage == null) {
            return error("delete", "Privilage not found.");
        }

        try {
            privilageDao.delete(privilage);
            return success();
        } catch (Exception e) {
            return error("delete", e.getMessage());
        }
    }
}
