package marketing.brand.service;

import marketing.brand.dto.ContactInquiryRequest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class ContactMailService {

  private static final DateTimeFormatter SENT_AT_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
  private static final String RECIPIENT = " ";
  private final JavaMailSender mailSender;
  private final String mailFrom;

  public ContactMailService(JavaMailSender mailSender,
      @Value("${spring.mail.username:no-reply@google.com}") String mailFrom) {
    this.mailSender = mailSender;
    this.mailFrom = mailFrom;
  }

  public void send(ContactInquiryRequest request) {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(mailFrom);
    message.setTo(RECIPIENT);
    message.setSubject("[브랜드페이지 " + request.subject() + " 문의] " + request.companyName());
    message.setText(buildBody(request));
    mailSender.send(message);
  }

  private String buildBody(ContactInquiryRequest request) {
    return """
        홈페이지 문의가 접수되었습니다.

        - 접수 시각  :  %s
        - 회 사 명   :  %s
        - 이 메 일   :  %s
        - 전화번호   :  %s
        - 문의 주제  :  %s
        - 분    류  :  %s
        - 약관 동의  :  %s

        [메시지]
        %s
        """.formatted(
        LocalDateTime.now().format(SENT_AT_FORMATTER),
        request.companyName(),
        request.email(),
        request.phone(),
        request.subject(),
        request.classification(),
        Boolean.TRUE.equals(request.termsAgreement()) ? "동의" : "미동의",
        request.message()
    );
  }
}
