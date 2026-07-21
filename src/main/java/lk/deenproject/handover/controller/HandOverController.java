package lk.deenproject.handover.controller;

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
import lk.deenproject.handover.entity.HandOver;
import lk.deenproject.handover.repository.HandOverRepository;

@RestController
public class HandOverController extends BaseController<HandOver, Integer> {

    @Autowired
    private HandOverRepository handOverDao;

    @Override
    protected HandOverRepository getRepository() {
        return handOverDao;
    }

    @Override
    protected String getEntityName() {
        return "handover";
    }

    @RequestMapping("/handover")
    public org.springframework.web.servlet.ModelAndView handoverPage() {
        return createPageView();
    }

    @PreAuthorize("hasAuthority('HANDOVER_SELECT')")
    @GetMapping(value = "/handover/alldata", produces = "application/json")
    public List<HandOver> getAllData() {
        return findAll();
    }

    @PreAuthorize("hasAuthority('HANDOVER_INSERT')")
    @PostMapping(value = "/handover/insert")
    public String saveData(@Valid @RequestBody HandOver handover) {
        try {
            handover.setAddeddatetime(LocalDateTime.now());
            handOverDao.save(handover);
            return success();
        } catch (Exception e) {
            return error("save", e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('HANDOVER_UPDATE')")
    @PutMapping(value = "/handover/update")
    public String updateData(@Valid @RequestBody HandOver handover) {
        try {
            handover.setUpdatedatetime(LocalDateTime.now());
            handOverDao.save(handover);
            return success();
        } catch (Exception e) {
            return error("update", e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('HANDOVER_DELETE')")
    @DeleteMapping(value = "/handover/delete")
    public String deleteData(@RequestBody HandOver handover) {
        HandOver existing = handOverDao.getReferenceById(handover.getId());
        if (existing == null) {
            return error("delete", "Handover not found.");
        }
        try {
            handOverDao.delete(handover);
            return success();
        } catch (Exception e) {
            return error("delete", e.getMessage());
        }
    }
}
