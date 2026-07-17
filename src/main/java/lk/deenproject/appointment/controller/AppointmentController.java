package lk.deenproject.appointment.controller;

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
import lk.deenproject.appointment.entity.Appointment;
import lk.deenproject.appointment.repository.AppointmentRepository;

@RestController
public class AppointmentController extends BaseController<Appointment, Integer> {

    @Autowired
    private AppointmentRepository appointmentDao;

    @Override
    protected AppointmentRepository getRepository() {
        return appointmentDao;
    }

    @Override
    protected String getEntityName() {
        return "appointment";
    }

    @RequestMapping("/appointment")
    public org.springframework.web.servlet.ModelAndView appointmentPage() {
        return createPageView();
    }

    @PreAuthorize("hasAuthority('APPOINTMENT_SELECT')")
    @GetMapping(value = "/appointment/alldata", produces = "application/json")
    public List<Appointment> getAllData() {
        return findAll();
    }

    @PreAuthorize("hasAuthority('APPOINTMENT_INSERT')")
    @PostMapping(value = "/appointment/insert")
    public String saveData(@Valid @RequestBody Appointment appointment) {
        try {
            appointment.setAppointment_no(generateCode("appointment", "appointment_no", "APT"));
            appointment.setAddeddatetime(LocalDateTime.now());
            appointmentDao.save(appointment);
            return success();
        } catch (Exception e) {
            return error("save", e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('APPOINTMENT_UPDATE')")
    @PutMapping(value = "/appointment/update")
    public String updateData(@Valid @RequestBody Appointment appointment) {
        try {
            appointment.setUpdatedatetime(LocalDateTime.now());
            appointmentDao.save(appointment);
            return success();
        } catch (Exception e) {
            return error("update", e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('APPOINTMENT_DELETE')")
    @DeleteMapping(value = "/appointment/delete")
    public String deleteData(@RequestBody Appointment appointment) {
        Appointment existingAppointment = appointmentDao.getReferenceById(appointment.getId());
        if (existingAppointment == null) {
            return error("delete", "Appointment not found.");
        }

        try {
            appointmentDao.delete(existingAppointment);
            return success();
        } catch (Exception e) {
            return error("delete", e.getMessage());
        }
    }
}
