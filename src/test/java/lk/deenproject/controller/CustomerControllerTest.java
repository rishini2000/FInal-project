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
class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(authorities = {"CUSTOMER_SELECT"})
    void getAllData_shouldReturn200() throws Exception {
        mockMvc.perform(get("/customer/alldata"))
                .andExpect(status().isOk());
    }

    @Test
    void unauthenticatedAccess_shouldRedirectToLogin() throws Exception {
        mockMvc.perform(get("/customer/alldata"))
                .andExpect(status().is3xxRedirection());
    }
}
