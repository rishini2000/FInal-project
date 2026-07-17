package lk.deenproject.loginpage.controller;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class LoginController {

    @GetMapping("/login")
    public ModelAndView loginPage(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            ModelAndView redirect = new ModelAndView();
            redirect.setViewName("redirect:/");
            return redirect;
        }

        ModelAndView loginUI = new ModelAndView();
        loginUI.setViewName("login.html");
        return loginUI;
    }

    @GetMapping("/dashboard")
    public ModelAndView dashboardPage() {
        ModelAndView dashboardUI = new ModelAndView();
        dashboardUI.setViewName("dashboard.html");
        dashboardUI.addObject("currentPage", "home");
        return dashboardUI;
    }
}
