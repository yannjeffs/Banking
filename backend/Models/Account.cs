namespace backend.Models;

public class Account
{
    public int AccountId { get; set; }
    public int UserId { get; set; }
    public string AccountNumber { get; set; } = string.Empty;
    public string AccountType { get; set; } = string.Empty;
    public decimal Balance { get; set; } = 0;
    public string Currency { get; set; } = "XAF";
    public DateTime OpenedAt { get; set; } = DateTime.Now;
    public bool IsActive { get; set; } = true;

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<Loan> Loans { get; set; } = new List<Loan>();
    public ICollection<Transaction> OutgoingTransactions { get; set; } = new List<Transaction>();
    public ICollection<Transaction> IncomingTransactions { get; set; } = new List<Transaction>();
}