package marketing.brand.controller;

import marketing.brand.dto.ContactInquiryRequest;
import marketing.brand.service.ContactMailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

  private final ContactMailService contactMailService;

  public ContactController(ContactMailService contactMailService) {
    this.contactMailService = contactMailService;
  }

  @PostMapping
  public ResponseEntity<String> send(@RequestBody ContactInquiryRequest request) {
    if (!isValid(request)) {
      return ResponseEntity.badRequest().body("입력값을 확인해 주세요.");
    }

    try {
      contactMailService.send(request);
      return ResponseEntity.ok("문의가 정상적으로 전송되었습니다.");
    } catch (Exception ex) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("문의 전송 중 오류가 발생했습니다.");
    }
  }

  private boolean isValid(ContactInquiryRequest request) {
    return hasText(request.companyName())
        && hasText(request.email())
        && hasText(request.phone())
        && hasText(request.subject())
        && hasText(request.classification())
        && hasText(request.message())
        && request.message().trim().length() <= 200
        && Boolean.TRUE.equals(request.termsAgreement());
  }

  private boolean hasText(String value) {
    return StringUtils.hasText(value);
  }
}
