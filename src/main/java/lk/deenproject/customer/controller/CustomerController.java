package lk.deenproject.customer.controller;

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
import lk.deenproject.customer.entity.Customer;
import lk.deenproject.customer.repository.CustomerRepository;

@RestController
public class CustomerController extends BaseController<Customer, Integer> {

    @Autowired
    private CustomerRepository customerDao;

    @Override
    protected CustomerRepository getRepository() {
        return customerDao;
    }

    @Override
    protected String getEntityName() {
        return "customer";
    }

    @RequestMapping("/customer")
    public org.springframework.web.servlet.ModelAndView customerPage() {
        return createPageView();
    }

    @PreAuthorize("hasAuthority('CUSTOMER_SELECT')")
    @GetMapping(value = "/customer/alldata", produces = "application/json")
    public List<Customer> getAllData() {
        return findAll();
    }

    @PreAuthorize("hasAuthority('CUSTOMER_INSERT')")
    @PostMapping(value = "/customer/insert")
    public String saveData(@Valid @RequestBody Customer customer) {
        Customer existingCustomerByMobile = customerDao.getByMobile(customer.getMobile());
        if (existingCustomerByMobile != null) {
            return error("save", "Customer already exists for the given mobile number.");
        }

        Customer existingCustomerByEmail = customerDao.getByEmail(customer.getEmail());
        if (existingCustomerByEmail != null) {
            return error("save", "Customer already exists for the given email.");
        }

        try {
            customer.setCustomercode(generateCode("customer", "customercode", "CUS"));
            customer.setAddeddatetime(LocalDateTime.now());
            customerDao.save(customer);
            return success();
        } catch (Exception e) {
            return error("save", e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('CUSTOMER_UPDATE')")
    @PutMapping(value = "/customer/update")
    public String updateData(@Valid @RequestBody Customer customer) {
        Customer existingCustomerByMobile = customerDao.getByMobile(customer.getMobile());
        if (existingCustomerByMobile != null && !existingCustomerByMobile.getId().equals(customer.getId())) {
            return error("update", "Customer already exists for the given mobile number.");
        }

        Customer existingCustomerByEmail = customerDao.getByEmail(customer.getEmail());
        if (existingCustomerByEmail != null && !existingCustomerByEmail.getId().equals(customer.getId())) {
            return error("update", "Customer already exists for the given email.");
        }

        try {
            customer.setUpdateddatetime(LocalDateTime.now());
            customerDao.save(customer);
            return success();
        } catch (Exception e) {
            return error("update", e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('CUSTOMER_DELETE')")
    @DeleteMapping(value = "/customer/delete")
    public String deleteData(@RequestBody Customer customer) {
        Customer existingCustomer = customerDao.getReferenceById(customer.getId());
        if (existingCustomer == null) {
            return error("delete", "Customer not found.");
        }

        try {
            customerDao.delete(customer);
            return success();
        } catch (Exception e) {
            return error("delete", e.getMessage());
        }
    }
}
