namespace backend.Models;

public class LoanPayment
{
    public int LoanPaymentId { get; set; }
    public int LoanId { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; } = DateTime.Now;
    public decimal PrincipalPaid { get; set; }
    public decimal InterestPaid { get; set; }
    public decimal RemainingBalance { get; set; }
    public string Status { get; set; } = "Effectue";

    // Navigation
    public Loan Loan { get; set; } = null!;
}