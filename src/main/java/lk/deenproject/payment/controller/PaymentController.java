package lk.deenproject.payment.controller;

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
import lk.deenproject.payment.entity.Payment;
import lk.deenproject.payment.repository.PaymentRepository;

@RestController
public class PaymentController extends BaseController<Payment, Long> {

    @Autowired
    private PaymentRepository paymentDao;

    @Override
    protected PaymentRepository getRepository() {
        return paymentDao;
    }

    @Override
    protected String getEntityName() {
        return "payment";
    }

    @RequestMapping("/payment")
    public org.springframework.web.servlet.ModelAndView paymentPage() {
        return createPageView();
    }

    @PreAuthorize("hasAuthority('PAYMENT_SELECT')")
    @GetMapping(value = "/payment/alldata", produces = "application/json")
    public List<Payment> getAllData() {
        return findAll();
    }

    @PreAuthorize("hasAuthority('PAYMENT_INSERT')")
    @PostMapping(value = "/payment/insert")
    public String saveData(@Valid @RequestBody Payment payment) {
        try {
            payment.setBill_no(generateCode("payment", "bill_no", "BIL"));
            payment.setAddeddatetime(LocalDateTime.now());
            paymentDao.save(payment);
            return success();
        } catch (Exception e) {
            return error("save", e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('PAYMENT_UPDATE')")
    @PutMapping(value = "/payment/update")
    public String updateData(@Valid @RequestBody Payment payment) {
        Payment existingPaymentByBillNo = paymentDao.getByBillNo(payment.getBill_no());
        if (existingPaymentByBillNo != null && !existingPaymentByBillNo.getId().equals(payment.getId())) {
            return error("update", "Payment already exists for the given bill number.");
        }

        try {
            paymentDao.save(payment);
            return success();
        } catch (Exception e) {
            return error("update", e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('PAYMENT_DELETE')")
    @DeleteMapping(value = "/payment/delete")
    public String deleteData(@RequestBody Payment payment) {
        try {
            paymentDao.delete(payment);
            return success();
        } catch (Exception e) {
            return error("delete", e.getMessage());
        }
    }
}
