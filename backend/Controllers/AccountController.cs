using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AccountController : ControllerBase
{
    private readonly AppDbContext _context;

    public AccountController(AppDbContext context)
    {
        _context = context;
    }

    // GET api/account — tous les comptes de l'utilisateur connecté
    [HttpGet]
    public async Task<IActionResult> GetMyAccounts()
    {
        var userId = GetUserId();
        var accounts = await _context.Accounts
            .Where(a => a.UserId == userId && a.IsActive)
            .Select(a => new {
                a.AccountId,
                a.AccountNumber,
                a.AccountType,
                a.Balance,
                a.Currency,
                a.OpenedAt
            })
            .ToListAsync();

        return Ok(accounts);
    }

    // GET api/account/{id} — détail d'un compte
    [HttpGet("{id}")]
    public async Task<IActionResult> GetAccount(int id)
    {
        var userId  = GetUserId();
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.AccountId == id && a.UserId == userId);

        if (account == null)
            return NotFound(new { message = "Compte introuvable." });

        return Ok(account);
    }

    // GET api/account/{id}/transactions — historique d'un compte
    [HttpGet("{id}/transactions")]
    public async Task<IActionResult> GetTransactions(int id)
    {
        var userId  = GetUserId();
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.AccountId == id && a.UserId == userId);

        if (account == null)
            return NotFound(new { message = "Compte introuvable." });

        var transactions = await _context.Transactions
            .Where(t => t.FromAccountId == id || t.ToAccountId == id)
            .OrderByDescending(t => t.TransactionDate)
            .Select(t => new {
                t.TransactionId,
                t.Amount,
                t.TransactionType,
                t.Description,
                t.TransactionDate,
                t.Status,
                Direction = t.FromAccountId == id ? "Débit" : "Crédit"
            })
            .ToListAsync();

        return Ok(transactions);
    }

    // Récupérer l'ID de l'utilisateur depuis le token JWT
    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}