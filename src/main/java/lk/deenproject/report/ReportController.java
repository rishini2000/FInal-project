package lk.deenproject.report;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import lk.deenproject.appointment.entity.Appointment;
import lk.deenproject.appointment.repository.AppointmentRepository;
import lk.deenproject.payment.entity.Payment;
import lk.deenproject.payment.repository.PaymentRepository;
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
}
