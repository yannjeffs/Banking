namespace backend.DTOs;

public class AdminStatsDto
{
    public int     TotalUsers       { get; set; }
    public int     TotalAccounts    { get; set; }
    public int     TotalLoans       { get; set; }
    public int     PendingLoans     { get; set; }
    public int     ActiveLoans      { get; set; }
    public decimal TotalDeposits    { get; set; }
    public decimal TotalLoanAmount  { get; set; }
    public int     TotalTransactions { get; set; }
}

public class UpdateSettingDto
{
    public string Value { get; set; } = string.Empty;
}

public class AdminUserDto
{
    public int      UserId    { get; set; }
    public string   FullName  { get; set; } = string.Empty;
    public string   Email     { get; set; } = string.Empty;
    public string?  Phone     { get; set; }
    public string   Role      { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool     IsActive  { get; set; }
    public int      AccountCount     { get; set; }
    public decimal  TotalBalance     { get; set; }
}

public class AdminAccountDto
{
    public int      AccountId     { get; set; }
    public string   AccountNumber { get; set; } = string.Empty;
    public string   AccountType   { get; set; } = string.Empty;
    public decimal  Balance       { get; set; }
    public string   Currency      { get; set; } = string.Empty;
    public DateTime OpenedAt      { get; set; }
    public bool     IsActive      { get; set; }
    public string   OwnerName     { get; set; } = string.Empty;
    public string   OwnerEmail    { get; set; } = string.Empty;
}

public class AdminTransactionDto
{
    public int      TransactionId   { get; set; }
    public decimal  Amount          { get; set; }
    public string   TransactionType { get; set; } = string.Empty;
    public string?  Description     { get; set; }
    public DateTime TransactionDate { get; set; }
    public string   Status          { get; set; } = string.Empty;
    public string?  FromAccount     { get; set; }
    public string?  ToAccount       { get; set; }
}

public class AdminLoanDto
{
    public int      LoanId         { get; set; }
    public string   OwnerName      { get; set; } = string.Empty;
    public string   OwnerEmail     { get; set; } = string.Empty;
    public string   AccountNumber  { get; set; } = string.Empty;
    public decimal  Amount         { get; set; }
    public decimal  InterestRate   { get; set; }
    public int      TermMonths     { get; set; }
    public decimal  MonthlyPayment { get; set; }
    public string   Status         { get; set; } = string.Empty;
    public DateOnly? StartDate     { get; set; }
    public DateOnly? EndDate       { get; set; }
    public DateTime CreatedAt      { get; set; }
}

public class CreateAccountDto
{
    public int    UserId      { get; set; }
    public string AccountType { get; set; } = string.Empty;
    public string Currency    { get; set; } = "XAF";
}

public class DepositWithdrawDto
{
    public string  AccountNumber { get; set; } = string.Empty;
    public decimal Amount        { get; set; }
    public string? Description   { get; set; }
}

public class RejectLoanDto
{
    public string? Reason { get; set; }
}