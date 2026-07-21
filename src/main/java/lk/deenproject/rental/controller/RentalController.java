package lk.deenproject.rental.controller;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lk.deenproject.common.BaseController;
import lk.deenproject.rental.entity.Rental;
import lk.deenproject.rental.repository.RentalRepository;

@RestController
public class RentalController extends BaseController<Rental, Integer> {

    @Autowired
    private RentalRepository rentalDao;

    @Override
    protected RentalRepository getRepository() {
        return rentalDao;
    }

    @Override
    protected String getEntityName() {
        return "rental";
    }

    @RequestMapping("/rental")
    public org.springframework.web.servlet.ModelAndView rentalPage() {
        return createPageView();
    }

    @PreAuthorize("hasAuthority('RENTAL_SELECT')")
    @GetMapping(value = "/rental/rent_no", produces = "application/json")
    public String getRentNoByIdAndCustomerName(@RequestParam("id") Integer id,
            @RequestParam("customer_name") String customerName) {
        Rental rental = rentalDao.findById(id).orElse(null);
        if (rental != null && rental.getCustomer_id() != null
                && rental.getCustomer_id().getFirstname().equals(customerName)) {
            return rental.getRent_no();
        }
        return null;
    }

    @PreAuthorize("hasAuthority('RENTAL_SELECT')")
    @GetMapping(value = "/rental/alldata", produces = "application/json")
    public List<Rental> getAllData() {
        return rentalDao.getActiveRentals();
    }

    @PreAuthorize("hasAuthority('RENTAL_SELECT')")
    @GetMapping(value = "/rental/byid/{id}", produces = "application/json")
    public Rental getById(@PathVariable Integer id) {
        return rentalDao.findById(id).orElse(null);
    }

    @PreAuthorize("hasAuthority('RENTAL_INSERT')")
    @PostMapping(value = "/rental/insert")
    public String saveData(@Valid @RequestBody Rental rental) {
        try {
            rental.setRent_no(generateCode("rental", "rent_no", "RNT"));
            rental.setAddeddatetime(LocalDateTime.now());

            // Set parent Rental for each Rental Item
            if (rental.getRentalHasItemList() != null) {
                rental.getRentalHasItemList().forEach(item -> {
                    item.setRental_id(rental);
                });
            }

            rentalDao.save(rental);
            return success();
        } catch (Exception e) {
            return error("save", e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('RENTAL_UPDATE')")
    @PutMapping(value = "/rental/update")
    public String updateData(@Valid @RequestBody Rental rental) {
        try {

            rental.setUpdatedatetime(LocalDateTime.now());

            if (rental.getRentalHasItemList() != null) {
                rental.getRentalHasItemList().forEach(item -> {
                    item.setRental_id(rental);
                });
            }

            rentalDao.save(rental);

            return success();

        } catch (Exception e) {
            return error("update", e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('RENTAL_DELETE')")
    @DeleteMapping(value = "/rental/delete")
    public String deleteData(@RequestBody Rental rental) {

        Rental existingRental = rentalDao.findById(rental.getId()).orElse(null);

        if (existingRental == null) {
            return error("delete", "Rental not found.");
        }

        try {

            existingRental.setDeletedatetime(LocalDateTime.now());

            if (existingRental.getRentalHasItemList() != null) {
                existingRental.getRentalHasItemList().forEach(item -> {
                    item.setRental_id(existingRental);
                });
            }

            rentalDao.save(existingRental);

            return success();

        } catch (Exception e) {
            return error("delete", e.getMessage());
        }
    }
}
