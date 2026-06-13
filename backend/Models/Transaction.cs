namespace backend.Models;

public class Transaction
{
    public int TransactionId { get; set; }
    public int? FromAccountId { get; set; }
    public int? ToAccountId { get; set; }
    public decimal Amount { get; set; }
    public string TransactionType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime TransactionDate { get; set; } = DateTime.Now;
    public string Status { get; set; } = "Completee";

    // Navigation
    public Account? FromAccount { get; set; }
    public Account? ToAccount { get; set; }
}