package marketing.brand.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

  @GetMapping("/")
  public String home(Model model) {
    setActiveMenu(model, "photobooth");
    return "photobooth";
  }

  @GetMapping("/photobooth")
  public String photobooth(Model model) {
    setActiveMenu(model, "photobooth");
    return "photobooth";
  }

  @GetMapping("/goods")
  public String goods(Model model) {
    setActiveMenu(model, "goods");
    return "goods";
  }

  private void setActiveMenu(Model model, String activeMenu) {
    model.addAttribute("activeMenu", activeMenu);
  }
}
