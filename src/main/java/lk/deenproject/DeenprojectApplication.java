package lk.deenproject;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

@SpringBootApplication
@RestController
public class DeenprojectApplication {

	public static void main(String[] args) {
		SpringApplication.run(DeenprojectApplication.class, args);
		System.out.println(".....DeenprojectApplication started successfully!........");
	}

	@RequestMapping("/")
	public ModelAndView indexPage() {
		ModelAndView homeUI = new ModelAndView();
		homeUI.setViewName("home.html");
		homeUI.addObject("currentPage", "home");
		return homeUI;
	}

}
