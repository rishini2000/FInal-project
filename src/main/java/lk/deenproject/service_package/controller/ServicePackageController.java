package lk.deenproject.service_package.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lk.deenproject.common.BaseController;
import lk.deenproject.service_package.entity.ServicePackage;
import lk.deenproject.service_package.repository.ServicePackageRepository;

@RestController
public class ServicePackageController extends BaseController<ServicePackage, Integer> {

    @Autowired
    private ServicePackageRepository servicePackageDao;

    @Override
    protected ServicePackageRepository getRepository() {
        return servicePackageDao;
    }

    @Override
    protected String getEntityName() {
        return "service_package";
    }

    @RequestMapping("/service_package")
    public org.springframework.web.servlet.ModelAndView servicePackagePage() {
        return createPageView();
    }

    @PreAuthorize("hasAuthority('SERVICE_PACKAGE_SELECT')")
    @GetMapping(value = "/service_package/alldata", produces = "application/json")
    public List<ServicePackage> getAllData() {
        return findAll();
    }

    @PreAuthorize("hasAuthority('SERVICE_PACKAGE_SELECT')")
    @GetMapping(value = "/service_package/byid/{id}", produces = "application/json")
    public ServicePackage getById(@PathVariable Integer id) {
        return servicePackageDao.findById(id).orElse(null);
    }

    @PreAuthorize("hasAuthority('SERVICE_PACKAGE_INSERT')")
    @PostMapping(value = "/service_package/insert")
    public String saveData(@Valid @RequestBody ServicePackage servicePackage) {
        ServicePackage existingPackage = servicePackageDao.findByName(servicePackage.getPackage_name());
        if (existingPackage != null) {
            return error("save", "Service Package with the same name already exists.");
        }

        try {
            servicePackage.setAddeddatetime(LocalDateTime.now());
            servicePackageDao.save(servicePackage);
            return success();
        } catch (Exception e) {
            return error("save", e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('SERVICE_PACKAGE_UPDATE')")
    @PutMapping(value = "/service_package/update")
    public String updateData(@Valid @RequestBody ServicePackage servicePackage) {
        ServicePackage existingPackage = servicePackageDao.findByName(servicePackage.getPackage_name());
        if (existingPackage != null && !existingPackage.getId().equals(servicePackage.getId())) {
            return error("update", "Service Package with the same name already exists.");
        }

        try {
            servicePackage.setUpdateddatetime(LocalDateTime.now());
            servicePackageDao.save(servicePackage);
            return success();
        } catch (Exception e) {
            return error("update", e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('SERVICE_PACKAGE_DELETE')")
    @DeleteMapping(value = "/service_package/delete")
    public String deleteData(@RequestBody ServicePackage servicePackage) {
        ServicePackage existingPackage = servicePackageDao.getReferenceById(servicePackage.getId());
        if (existingPackage == null) {
            return error("delete", "Service Package not found.");
        }

        try {
            servicePackage.setDeletedatetime(LocalDateTime.now());
            servicePackageDao.delete(existingPackage);
            return success();
        } catch (Exception e) {
            return error("delete", e.getMessage());
        }
    }
}
