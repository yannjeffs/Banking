namespace backend.Models;

public class Loan
{
    public int LoanId { get; set; }
    public int UserId { get; set; }
    public int AccountId { get; set; }
    public decimal Amount { get; set; }
    public decimal InterestRate { get; set; }
    public int TermMonths { get; set; }
    public decimal MonthlyPayment { get; set; }
    public string Status { get; set; } = "En attente";
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Navigation
    public User User { get; set; } = null!;
    public Account Account { get; set; } = null!;
    public ICollection<LoanPayment> Payments { get; set; } = new List<LoanPayment>();
}