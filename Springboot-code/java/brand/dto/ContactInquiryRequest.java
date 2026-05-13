package marketing.brand.dto;

public record ContactInquiryRequest(
    String companyName,
    String email,
    String phone,
    String subject,
    String classification,
    String message,
    Boolean termsAgreement
) {
}
