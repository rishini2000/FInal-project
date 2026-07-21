package lk.deenproject.appointment.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lk.deenproject.appointment.entity.Appointment;
import lk.deenproject.appointment.entity.AppointmentHasService;
import lk.deenproject.appointment.entity.AppointmentHasServicePackage;
import lk.deenproject.appointment.repository.AppointmentHasServiceRepository;
import lk.deenproject.appointment.repository.AppointmentHasServicePackageRepository;
import lk.deenproject.appointment.repository.AppointmentRepository;
import lk.deenproject.appointment.service.AvailabilityService;
import lk.deenproject.common.BaseController;

@RestController
public class AppointmentController extends BaseController<Appointment, Integer> {

    @Autowired
    private AppointmentRepository appointmentDao;

    @Autowired
    private AppointmentHasServicePackageRepository appointmentHasServicePackageRepository;

    @Autowired
    private AppointmentHasServiceRepository appointmentHasServiceRepository;

    @Autowired
    private AvailabilityService availabilityService;

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

    @PreAuthorize("hasAuthority('APPOINTMENT_UPDATE')")
    @DeleteMapping(value = "/appointment/remove-package")
    public String removeServicePackage(@RequestBody AppointmentHasServicePackage appointmentHasServicePackage) {
        try {
            appointmentHasServicePackageRepository.delete(appointmentHasServicePackage);
            return success();
        } catch (Exception e) {
            return error("remove-package", e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('APPOINTMENT_UPDATE')")
    @DeleteMapping(value = "/appointment/remove-service")
    public String removeService(@RequestBody AppointmentHasService appointmentHasService) {
        try {
            appointmentHasServiceRepository.delete(appointmentHasService);
            return success();
        } catch (Exception e) {
            return error("remove-service", e.getMessage());
        }
    }

    @PreAuthorize("hasAuthority('APPOINTMENT_SELECT')")
    @GetMapping(value = "/appointment/check-availability")
    public Map<String, Object> checkAvailability(
            @RequestParam Integer employeeId,
            @RequestParam String date,
            @RequestParam String startTime,
            @RequestParam String endTime) {

        Map<String, Object> response = new HashMap<>();
        try {
            LocalDate localDate = LocalDate.parse(date);
            LocalTime localStartTime = LocalTime.parse(startTime);
            LocalTime localEndTime = LocalTime.parse(endTime);

            boolean available = availabilityService.isEmployeeAvailable(employeeId, localDate, localStartTime, localEndTime);

            response.put("available", available);
            response.put("message", available ? "Employee is available" : "Employee is not available for the selected time");

            return response;
        } catch (Exception e) {
            response.put("available", false);
            response.put("message", "Error checking availability: " + e.getMessage());
            return response;
        }
    }
}
