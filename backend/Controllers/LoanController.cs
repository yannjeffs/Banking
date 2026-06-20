using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend.Data;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

public class LoanRequestDto
{
    public int AccountId { get; set; }
    public decimal Amount { get; set; }
    public decimal InterestRate { get; set; }
    public int TermMonths { get; set; }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LoanController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly NotificationService _notifService;

    public LoanController(AppDbContext context, NotificationService notifService)
    {
        _context = context;
        _notifService = notifService;
    }

    // POST api/loan/request — demander un prêt
    [HttpPost("request")]
    public async Task<IActionResult> RequestLoan(LoanRequestDto dto)
    {
        var userId = GetUserId();
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.AccountId == dto.AccountId
                                   && a.UserId == userId);

        if (account == null)
            return BadRequest(new { message = "Compte introuvable." });

        var monthlyPayment = CalculateMonthlyPayment(dto.Amount, dto.InterestRate, dto.TermMonths);

        var loan = new Loan
        {
            UserId = userId,
            AccountId = dto.AccountId,
            Amount = dto.Amount,
            InterestRate = dto.InterestRate,
            TermMonths = dto.TermMonths,
            MonthlyPayment = monthlyPayment,
            Status = "En attente"
        };

        _context.Loans.Add(loan);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Demande de prêt soumise.",
            loanId = loan.LoanId,
            monthlyPayment = monthlyPayment
        });
    }

    // GET api/loan — mes prêts
    [HttpGet]
    public async Task<IActionResult> GetMyLoans()
    {
        var userId = GetUserId();
        var loans = await _context.Loans
            .Where(l => l.UserId == userId)
            .Select(l => new
            {
                l.LoanId,
                l.Amount,
                l.InterestRate,
                l.TermMonths,
                l.MonthlyPayment,
                l.Status,
                l.StartDate,
                l.EndDate,
                l.CreatedAt
            })
            .ToListAsync();

        return Ok(loans);
    }

    // PUT api/loan/{id}/approve — approuver (Admin)
    [HttpPut("{id}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ApproveLoan(int id)
    {
        var loan = await _context.Loans
            .Include(l => l.Account)
            .FirstOrDefaultAsync(l => l.LoanId == id);

        if (loan == null)
            return NotFound(new { message = "Prêt introuvable." });

        if (loan.Status != "En attente")
            return BadRequest(new { message = "Ce prêt a déjà été traité." });

        loan.Status = "Actif";
        loan.StartDate = DateOnly.FromDateTime(DateTime.Now);
        loan.EndDate = DateOnly.FromDateTime(DateTime.Now.AddMonths(loan.TermMonths));

        // Créditer le compte
        loan.Account.Balance += loan.Amount;

        _context.Transactions.Add(new Transaction
        {
            ToAccountId = loan.AccountId,
            Amount = loan.Amount,
            TransactionType = "Depot",
            Description = $"Déblocage prêt #{loan.LoanId}",
            Status = "Completee"
        });

        await _context.SaveChangesAsync();

        await _notifService.NotifyAsync(
            loan.UserId,
            "Prêt approuvé 🎉",
            $"Votre demande de prêt de {loan.Amount:N0} XAF a été approuvée. Les fonds ont été versés sur votre compte {loan.Account.AccountNumber}.",
            "Pret"
        );

        return Ok(new { message = "Prêt approuvé et fonds versés." });
    }

    // GET api/loan/{id}/schedule — tableau d'amortissement
    [HttpGet("{id}/schedule")]
    public async Task<IActionResult> GetSchedule(int id)
    {
        var userId = GetUserId();
        var loan = await _context.Loans
            .FirstOrDefaultAsync(l => l.LoanId == id && l.UserId == userId);

        if (loan == null)
            return NotFound(new { message = "Prêt introuvable." });

        var schedule = GenerateAmortizationSchedule(loan);
        return Ok(schedule);
    }

    // GET api/loan/all — tous les prêts (Admin)
    [HttpGet("all")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllLoans()
    {
        var loans = await _context.Loans
            .Include(l => l.User)
            .Include(l => l.Account)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

        return Ok(loans);
    }

    // --- Helpers ---
    private static decimal CalculateMonthlyPayment(decimal amount, decimal annualRate, int months)
    {
        if (annualRate == 0) return amount / months;
        var r = annualRate / 100 / 12;
        var payment = amount * r * (decimal)Math.Pow((double)(1 + r), months)
                      / ((decimal)Math.Pow((double)(1 + r), months) - 1);
        return Math.Round(payment, 2);
    }

    private static List<object> GenerateAmortizationSchedule(Loan loan)
    {
        var schedule = new List<object>();
        var balance = loan.Amount;
        var r = loan.InterestRate / 100 / 12;

        for (int i = 1; i <= loan.TermMonths; i++)
        {
            var interest = Math.Round(balance * r, 2);
            var principal = Math.Round(loan.MonthlyPayment - interest, 2);
            balance = Math.Round(balance - principal, 2);

            schedule.Add(new
            {
                Month = i,
                Payment = loan.MonthlyPayment,
                PrincipalPaid = principal,
                InterestPaid = interest,
                RemainingBalance = balance < 0 ? 0 : balance
            });
        }
        return schedule;
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}