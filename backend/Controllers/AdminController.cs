using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly NotificationService _notifService;

    public AdminController(AppDbContext context, NotificationService notifService)
    {
        _context = context;
        _notifService = notifService;
    }

    // ══════════════════════════════════════════
    // STATISTIQUES GLOBALES
    // GET api/admin/stats
    // ══════════════════════════════════════════
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var totalUsers = await _context.Users.CountAsync(u => u.Role == "Client");
        var totalAccounts = await _context.Accounts.CountAsync();
        var totalTransactions = await _context.Transactions.CountAsync();
        var totalDeposits = await _context.Accounts.SumAsync(a => a.Balance);
        var totalLoans = await _context.Loans.CountAsync();
        var pendingLoans = await _context.Loans.CountAsync(l => l.Status == "En attente");
        var activeLoans = await _context.Loans.CountAsync(l => l.Status == "Actif");
        var totalLoanAmount = await _context.Loans
            .Where(l => l.Status == "Actif")
            .SumAsync(l => l.Amount);

        return Ok(new AdminStatsDto
        {
            TotalUsers = totalUsers,
            TotalAccounts = totalAccounts,
            TotalLoans = totalLoans,
            PendingLoans = pendingLoans,
            ActiveLoans = activeLoans,
            TotalDeposits = totalDeposits,
            TotalLoanAmount = totalLoanAmount,
            TotalTransactions = totalTransactions,
        });
    }

    // ══════════════════════════════════════════
    // GESTION CLIENTS
    // GET api/admin/users
    // ══════════════════════════════════════════
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _context.Users
            .Include(u => u.Accounts)
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new AdminUserDto
            {
                UserId = u.UserId,
                FullName = u.FirstName + " " + u.LastName,
                Email = u.Email,
                Phone = u.Phone,
                Role = u.Role,
                CreatedAt = u.CreatedAt,
                IsActive = u.IsActive,
                AccountCount = u.Accounts.Count,
                TotalBalance = u.Accounts.Sum(a => a.Balance),
            })
            .ToListAsync();

        return Ok(users);
    }

    // GET api/admin/users/{id}
    [HttpGet("users/{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _context.Users
            .Include(u => u.Accounts)
            .Include(u => u.Loans)
            .FirstOrDefaultAsync(u => u.UserId == id);

        if (user == null)
            return NotFound(new { message = "Utilisateur introuvable." });

        return Ok(new
        {
            user.UserId,
            FullName = user.FirstName + " " + user.LastName,
            user.Email,
            user.Phone,
            user.Role,
            user.CreatedAt,
            user.IsActive,
            Accounts = user.Accounts.Select(a => new
            {
                a.AccountId,
                a.AccountNumber,
                a.AccountType,
                a.Balance,
                a.Currency,
                a.IsActive,
            }),
            Loans = user.Loans.Select(l => new
            {
                l.LoanId,
                l.Amount,
                l.Status,
                l.MonthlyPayment,
            }),
        });
    }

    // PUT api/admin/users/{id}/toggle
    [HttpPut("users/{id}/toggle")]
    public async Task<IActionResult> ToggleUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "Utilisateur introuvable." });

        user.IsActive = !user.IsActive;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = user.IsActive ? "Utilisateur activé." : "Utilisateur désactivé.",
            isActive = user.IsActive
        });
    }

    // PUT api/admin/users/{id}/promote
    [HttpPut("users/{id}/promote")]
    public async Task<IActionResult> PromoteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "Utilisateur introuvable." });

        if (user.Role == "Admin")
            return BadRequest(new { message = "Cet utilisateur est déjà Admin." });

        user.Role = "Admin";
        await _context.SaveChangesAsync();

        return Ok(new { message = $"{user.FirstName} {user.LastName} est maintenant Admin." });
    }

    // ══════════════════════════════════════════
    // GESTION COMPTES
    // GET api/admin/accounts
    // ══════════════════════════════════════════
    [HttpGet("accounts")]
    public async Task<IActionResult> GetAllAccounts()
    {
        var accounts = await _context.Accounts
            .Include(a => a.User)
            .OrderByDescending(a => a.OpenedAt)
            .Select(a => new AdminAccountDto
            {
                AccountId = a.AccountId,
                AccountNumber = a.AccountNumber,
                AccountType = a.AccountType,
                Balance = a.Balance,
                Currency = a.Currency,
                OpenedAt = a.OpenedAt,
                IsActive = a.IsActive,
                OwnerName = a.User.FirstName + " " + a.User.LastName,
                OwnerEmail = a.User.Email,
            })
            .ToListAsync();

        return Ok(accounts);
    }

    // POST api/admin/accounts — créer un compte pour un client
    [HttpPost("accounts")]
    public async Task<IActionResult> CreateAccount(CreateAccountDto dto)
    {
        var user = await _context.Users.FindAsync(dto.UserId);
        if (user == null)
            return NotFound(new { message = "Utilisateur introuvable." });

        var account = new Account
        {
            UserId = dto.UserId,
            AccountNumber = $"BK-{DateTime.Now:yyyyMMdd}-{new Random().Next(1000, 9999)}",
            AccountType = dto.AccountType,
            Balance = 0,
            Currency = dto.Currency,
        };

        _context.Accounts.Add(account);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Compte créé avec succès.",
            accountNumber = account.AccountNumber
        });
    }

    // PUT api/admin/accounts/{id}/toggle
    [HttpPut("accounts/{id}/toggle")]
    public async Task<IActionResult> ToggleAccount(int id)
    {
        var account = await _context.Accounts.FindAsync(id);
        if (account == null)
            return NotFound(new { message = "Compte introuvable." });

        account.IsActive = !account.IsActive;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = account.IsActive ? "Compte activé." : "Compte désactivé.",
            isActive = account.IsActive
        });
    }

    // ══════════════════════════════════════════
    // TRANSACTIONS GLOBALES
    // GET api/admin/transactions
    // ══════════════════════════════════════════
    [HttpGet("transactions")]
    public async Task<IActionResult> GetAllTransactions(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? type = null,
        [FromQuery] string? status = null)
    {
        var query = _context.Transactions
            .Include(t => t.FromAccount)
            .Include(t => t.ToAccount)
            .AsQueryable();

        if (!string.IsNullOrEmpty(type))
            query = query.Where(t => t.TransactionType == type);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(t => t.Status == status);

        var total = await query.CountAsync();

        var transactions = await query
            .OrderByDescending(t => t.TransactionDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new AdminTransactionDto
            {
                TransactionId = t.TransactionId,
                Amount = t.Amount,
                TransactionType = t.TransactionType,
                Description = t.Description,
                TransactionDate = t.TransactionDate,
                Status = t.Status,
                FromAccount = t.FromAccount != null ? t.FromAccount.AccountNumber : null,
                ToAccount = t.ToAccount != null ? t.ToAccount.AccountNumber : null,
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, data = transactions });
    }

    // ══════════════════════════════════════════
    // GESTION PRÊTS
    // GET api/admin/loans
    // ══════════════════════════════════════════
    [HttpGet("loans")]
    public async Task<IActionResult> GetAllLoans([FromQuery] string? status = null)
    {
        var query = _context.Loans
            .Include(l => l.User)
            .Include(l => l.Account)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
            query = query.Where(l => l.Status == status);

        var loans = await query
            .OrderByDescending(l => l.CreatedAt)
            .Select(l => new AdminLoanDto
            {
                LoanId = l.LoanId,
                OwnerName = l.User.FirstName + " " + l.User.LastName,
                OwnerEmail = l.User.Email,
                AccountNumber = l.Account.AccountNumber,
                Amount = l.Amount,
                InterestRate = l.InterestRate,
                TermMonths = l.TermMonths,
                MonthlyPayment = l.MonthlyPayment,
                Status = l.Status,
                StartDate = l.StartDate,
                EndDate = l.EndDate,
                CreatedAt = l.CreatedAt,
            })
            .ToListAsync();

        return Ok(loans);
    }

    // PUT api/admin/loans/{id}/reject
    [HttpPut("loans/{id}/reject")]
    public async Task<IActionResult> RejectLoan(int id, [FromBody] RejectLoanDto dto)
    {
        var loan = await _context.Loans.FindAsync(id);
        if (loan == null)
            return NotFound(new { message = "Prêt introuvable." });

        if (loan.Status != "En attente")
            return BadRequest(new { message = "Ce prêt a déjà été traité." });

        loan.Status = "Rejete";
        await _context.SaveChangesAsync();

        await _notifService.NotifyAsync(
    loan.UserId,
    "Prêt rejeté",
    $"Votre demande de prêt de {loan.Amount:N0} XAF a été rejetée.",
    "Pret"
);

        return Ok(new { message = $"Prêt #{id} rejeté." });
    }

    // ══════════════════════════════════════════
    // DÉPÔTS & RETRAITS
    // POST api/admin/deposit
    // ══════════════════════════════════════════
    [HttpPost("deposit")]
    public async Task<IActionResult> Deposit(DepositWithdrawDto dto)
    {
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.AccountNumber == dto.AccountNumber && a.IsActive);

        if (account == null)
            return NotFound(new { message = "Compte introuvable ou inactif." });

        account.Balance += dto.Amount;

        _context.Transactions.Add(new Transaction
        {
            ToAccountId = account.AccountId,
            Amount = dto.Amount,
            TransactionType = "Depot",
            Description = dto.Description ?? "Dépôt administrateur",
            Status = "Completee",
        });

        await _context.SaveChangesAsync();

        await _notifService.NotifyAsync(
            account.UserId,
            "Dépôt reçu",
            $"Un dépôt de {dto.Amount:N0} XAF a été effectué sur votre compte {account.AccountNumber}.",
            "Depot"
        );

        return Ok(new { message = "Dépôt effectué.", newBalance = account.Balance });
    }

    // POST api/admin/withdraw
    [HttpPost("withdraw")]
    public async Task<IActionResult> Withdraw(DepositWithdrawDto dto)
    {
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.AccountNumber == dto.AccountNumber && a.IsActive);

        if (account == null)
            return NotFound(new { message = "Compte introuvable ou inactif." });

        if (account.Balance < dto.Amount)
            return BadRequest(new { message = "Solde insuffisant." });

        account.Balance -= dto.Amount;

        _context.Transactions.Add(new Transaction
        {
            FromAccountId = account.AccountId,
            Amount = dto.Amount,
            TransactionType = "Retrait",
            Description = dto.Description ?? "Retrait administrateur",
            Status = "Completee",
        });

        await _context.SaveChangesAsync();

        await _notifService.NotifyAsync(
            account.UserId,
            "Retrait effectué",
            $"Un retrait de {dto.Amount:N0} XAF a été effectué sur votre compte {account.AccountNumber}.",
            "Retrait"
        );

        return Ok(new { message = "Retrait effectué.", newBalance = account.Balance });
    }
}