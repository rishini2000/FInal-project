package lk.deenproject.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import lk.deenproject.Privilage.Entity.Module;
import lk.deenproject.Privilage.Repository.ModuleRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PrivilageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ModuleRepository moduleDao;

    @Test
    @WithMockUser(authorities = {"PRIVALAGE_SELECT"})
    void getAllModules_shouldReturnModules() throws Exception {
        mockMvc.perform(get("/module/alldata"))
                .andExpect(status().isOk());
    }
}
