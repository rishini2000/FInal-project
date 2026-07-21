package lk.deenproject.appointment.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lk.deenproject.appointment.entity.Appointment;
import lk.deenproject.appointment.repository.AppointmentRepository;
import lk.deenproject.employee.Entity.EmployeePermLeave;
import lk.deenproject.employee.Repository.EmployeePermLeaveRepository;
import lk.deenproject.leaveplan.entity.LeaveDay;
import lk.deenproject.leaveplan.entity.LeavePlan;
import lk.deenproject.leaveplan.repository.LeaveDayRepository;
import lk.deenproject.leaveplan.repository.LeavePlanRepository;

@Service
public class AvailabilityService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private EmployeePermLeaveRepository employeePermLeaveRepository;

    @Autowired
    private LeaveDayRepository leaveDayRepository;

    @Autowired
    private LeavePlanRepository leavePlanRepository;

    public boolean isEmployeeAvailable(Integer employeeId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        // Check permanent leave
        if (isOnPermanentLeave(employeeId, date)) {
            return false;
        }

        // Check leave plan
        if (isOnLeavePlan(employeeId, date, startTime, endTime)) {
            return false;
        }

        // Check existing appointments
        if (hasConflictingAppointment(employeeId, date, startTime, endTime)) {
            return false;
        }

        return true;
    }

    private boolean isOnPermanentLeave(Integer employeeId, LocalDate date) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        String dayName = dayOfWeek.toString().charAt(0) + dayOfWeek.toString().substring(1).toLowerCase();

        List<EmployeePermLeave> permLeaves = employeePermLeaveRepository.getByEmployee(employeeId);
        return permLeaves.stream()
                .anyMatch(leave -> leave.getDay_of_week().equals(dayName));
    }

    private boolean isOnLeavePlan(Integer employeeId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        List<LeavePlan> leavePlans = leavePlanRepository.findByEmployeeId(employeeId);

        for (LeavePlan leavePlan : leavePlans) {
            List<LeaveDay> leaveDays = leaveDayRepository.findByLeavePlanId(leavePlan.getId());

            for (LeaveDay leaveDay : leaveDays) {
                if (leaveDay.getLeave_date().equals(date)) {
                    // Check if leave covers the appointment time
                    if (leaveDay.getLeave_type().equals("Full Day")) {
                        return true;
                    } else {
                        // Half day - check if appointment overlaps
                        LocalTime leaveStart = leaveDay.getStart_time();
                        LocalTime leaveEnd = leaveDay.getEnd_time();

                        // Check if appointment time overlaps with leave time
                        if (startTime.isBefore(leaveEnd) && endTime.isAfter(leaveStart)) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    private boolean hasConflictingAppointment(Integer employeeId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        List<Appointment> appointments = appointmentRepository.findByEmployeeIdAndDate(employeeId, date);

        for (Appointment appointment : appointments) {
            if (appointment.getAppointmentStatus().toString().equals("CANCELLED")) {
                continue;
            }

            LocalTime apptStart = appointment.getStart_time();
            LocalTime apptEnd = appointment.getEnd_time();

            // Check if time ranges overlap
            if (startTime.isBefore(apptEnd) && endTime.isAfter(apptStart)) {
                return true;
            }
        }

        return false;
    }
}
