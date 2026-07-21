package lk.deenproject.report;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import lk.deenproject.appointment.entity.Appointment;
import lk.deenproject.appointment.repository.AppointmentRepository;
import lk.deenproject.customer.entity.Customer;
import lk.deenproject.customer.repository.CustomerRepository;
import lk.deenproject.payment.entity.Payment;
import lk.deenproject.payment.repository.PaymentRepository;
import lk.deenproject.report.dto.CreditReportDTO;
import lk.deenproject.rental.entity.Rental;
import lk.deenproject.rental.repository.RentalRepository;

@RestController
public class ReportController {

    @Autowired
    private PaymentRepository paymentDao;
    @Autowired
    private AppointmentRepository appointmentDao;
    @Autowired
    private RentalRepository rentalDao;
    @Autowired
    private CustomerRepository customerDao;

    private ModelAndView createReportView(String reportName) {
        ModelAndView mv = new ModelAndView(reportName);
        mv.addObject("currentPage", reportName.replace("report_", ""));
        return mv;
    }

    @RequestMapping("/reports/revenue")
    public ModelAndView revenueReportPage() {
        return createReportView("report_revenue");
    }

    @RequestMapping("/reports/appointments")
    public ModelAndView appointmentReportPage() {
        return createReportView("report_appointments");
    }

    @RequestMapping("/reports/rentals")
    public ModelAndView rentalReportPage() {
        return createReportView("report_rentals");
    }

    @PreAuthorize("hasAuthority('PAYMENT_SELECT')")
    @GetMapping(value = "/reports/revenue/data", produces = "application/json")
    public List<Payment> getRevenueData() {
        return paymentDao.findAll();
    }

    @PreAuthorize("hasAuthority('APPOINTMENT_SELECT')")
    @GetMapping(value = "/reports/appointments/data", produces = "application/json")
    public List<Appointment> getAppointmentData() {
        return appointmentDao.findAll();
    }

    @PreAuthorize("hasAuthority('RENTAL_SELECT')")
    @GetMapping(value = "/reports/rentals/data", produces = "application/json")
    public List<Rental> getRentalData() {
        return rentalDao.findAll();
    }

    @RequestMapping("/reports/payments")
    public ModelAndView paymentReportPage() {
        return createReportView("report_payments");
    }

    @RequestMapping("/reports/credit")
    public ModelAndView creditReportPage() {
        return createReportView("report_credit");
    }

    @PreAuthorize("hasAuthority('PAYMENT_SELECT')")
    @GetMapping(value = "/reports/payments/data", produces = "application/json")
    public List<Payment> getPaymentReportData() {
        return paymentDao.findAll();
    }

    @PreAuthorize("hasAuthority('PAYMENT_SELECT')")
    @GetMapping(value = "/reports/credit/data", produces = "application/json")
    public List<CreditReportDTO> getCreditReportData() {
        List<Payment> payments = paymentDao.findAll();
        List<CreditReportDTO> creditList = new ArrayList<>();

        payments.stream()
            .filter(p -> p.getPaybalance_amount() != null && p.getPaybalance_amount().compareTo(BigDecimal.ZERO) > 0)
            .filter(p -> p.getAppointment_id() != null && p.getAppointment_id().getCustomer_id() != null)
            .collect(Collectors.groupingBy(p -> p.getAppointment_id().getCustomer_id().getId()))
            .forEach((customerId, customerPayments) -> {
                Customer customer = customerPayments.get(0).getAppointment_id().getCustomer_id();
                BigDecimal totalCredit = customerPayments.stream()
                    .map(Payment::getPaybalance_amount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                LocalDateTime lastPaymentDate = customerPayments.stream()
                    .map(Payment::getAddeddatetime)
                    .max(LocalDateTime::compareTo)
                    .orElse(null);
                long appointmentCount = customerPayments.stream()
                    .map(Payment::getAppointment_id)
                    .distinct()
                    .count();

                creditList.add(new CreditReportDTO(
                    customer.getId(),
                    customer.getFirstname() + " " + customer.getLastname(),
                    customer.getMobile(),
                    totalCredit,
                    lastPaymentDate,
                    appointmentCount
                ));
            });

        return creditList;
    }
}
