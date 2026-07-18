package lk.deenproject.pickup.controller;

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
import lk.deenproject.pickup.entity.PickUp;
import lk.deenproject.pickup.repository.PickUpRepository;

@RestController
public class PickUpController extends BaseController<PickUp, Integer> {

    @Autowired
    private PickUpRepository pickUpDao;

    @Override
    protected PickUpRepository getRepository() {
        return pickUpDao;
    }

    @Override
    protected String getEntityName() {
        return "pickup";
    }

    @RequestMapping("/pickup")
    public org.springframework.web.servlet.ModelAndView pickupPage() {
        return createPageView();
    }

    @PreAuthorize("hasAuthority('PICKUP_SELECT')")
    @GetMapping(value = "/pickup/alldata", produces = "application/json")
    public List<PickUp> getAllData() {
        return findAll();
    }

    @PreAuthorize("hasAuthority('PICKUP_SELECT')")
    @GetMapping(value = "/pickup/byid/{id}", produces = "application/json")
    public PickUp getById(@PathVariable Integer id) {

        return pickUpDao.findById(id).orElse(null);

    }

    @PreAuthorize("hasAuthority('PICKUP_INSERT')")
    @PostMapping(value = "/pickup/insert")
    public String saveData(@Valid @RequestBody PickUp pickUp) {
        try {
            pickUpDao.save(pickUp);
            return success();
        } catch (Exception e) {
            return error("save", e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('PICKUP_UPDATE')")
    @PutMapping(value = "/pickup/update")
    public String updateData(@Valid @RequestBody PickUp pickUp) {
        try {
            pickUpDao.save(pickUp);
            return success();
        } catch (Exception e) {
            return error("update", e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('PICKUP_DELETE')")
    @DeleteMapping(value = "/pickup/delete")
    public String deleteData(@RequestBody PickUp pickUp) {
        try {
            pickUpDao.delete(pickUp);
            return success();
        } catch (Exception e) {
            return error("delete", e.getMessage());
        }
    }
}
