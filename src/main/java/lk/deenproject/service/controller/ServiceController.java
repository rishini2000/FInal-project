package lk.deenproject.service.controller;

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
import lk.deenproject.service.entity.Service;
import lk.deenproject.service.repository.ServiceRepository;

@RestController
public class ServiceController extends BaseController<Service, Integer> {

    @Autowired
    private ServiceRepository serviceDao;

    @Override
    protected ServiceRepository getRepository() {
        return serviceDao;
    }

    @Override
    protected String getEntityName() {
        return "service";
    }

    @RequestMapping("/service")
    public org.springframework.web.servlet.ModelAndView servicePage() {
        return createPageView();
    }

    @PreAuthorize("hasAuthority('SERVICE_SELECT')")
    @GetMapping(value = "/service/alldata", produces = "application/json")
    public List<Service> getAllData() {
        return findAll();
    }

    @PreAuthorize("hasAuthority('SERVICE_INSERT')")
    @PostMapping(value = "/service/insert")
    public String saveData(@Valid @RequestBody Service service) {
        try {
            service.setServicecode(generateCode("service", "servicecode", "SRV"));
            serviceDao.save(service);
            return success();
        } catch (Exception e) {
            return error("save", e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('SERVICE_UPDATE')")
    @PutMapping(value = "/service/update")
    public String updateData(@Valid @RequestBody Service service) {
        Service existingServiceByCode = serviceDao.getByServicecode(service.getServicecode());
        if (existingServiceByCode != null && !existingServiceByCode.getId().equals(service.getId())) {
            return error("update", "Service already exists for the given service code.");
        }

        try {
            serviceDao.save(service);
            return success();
        } catch (Exception e) {
            return error("update", e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('SERVICE_DELETE')")
    @DeleteMapping(value = "/service/delete")
    public String deleteData(@RequestBody Service service) {
        Service existingService = serviceDao.getReferenceById(service.getId());
        if (existingService == null) {
            return error("delete", "Service not found.");
        }

        try {
            serviceDao.delete(existingService);
            return success();
        } catch (Exception e) {
            return error("delete", e.getMessage());
        }
    }
}
