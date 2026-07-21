package lk.deenproject.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(authorities = {"PAYMENT_SELECT"})
    void revenueReportPage_shouldReturn200() throws Exception {
        mockMvc.perform(get("/reports/revenue"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = {"APPOINTMENT_SELECT"})
    void appointmentReportPage_shouldReturn200() throws Exception {
        mockMvc.perform(get("/reports/appointments"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = {"RENTAL_SELECT"})
    void rentalReportPage_shouldReturn200() throws Exception {
        mockMvc.perform(get("/reports/rentals"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = {"PAYMENT_SELECT"})
    void revenueData_shouldReturn200() throws Exception {
        mockMvc.perform(get("/reports/revenue/data"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = {"APPOINTMENT_SELECT"})
    void appointmentData_shouldReturn200() throws Exception {
        mockMvc.perform(get("/reports/appointments/data"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = {"RENTAL_SELECT"})
    void rentalData_shouldReturn200() throws Exception {
        mockMvc.perform(get("/reports/rentals/data"))
                .andExpect(status().isOk());
    }
}
