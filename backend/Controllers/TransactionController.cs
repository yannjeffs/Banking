using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend.Data;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

public class TransferDto
{
    public int FromAccountId { get; set; }
    public int ToAccountNumber { get; set; }
    public string ToAccountNumber_Str { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Description { get; set; }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransactionController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly NotificationService _notifService;

    public TransactionController(AppDbContext context, NotificationService notifService)
    {
        _context = context;
        _notifService = notifService;
    }

    // POST api/transaction/transfer — effectuer un virement
    [HttpPost("transfer")]
    public async Task<IActionResult> Transfer(TransferDto dto)
    {
        var userId = GetUserId();

        // Vérifier que le compte source appartient à l'utilisateur
        var fromAccount = await _context.Accounts
            .FirstOrDefaultAsync(a => a.AccountId == dto.FromAccountId
                                   && a.UserId == userId
                                   && a.IsActive);

        if (fromAccount == null)
            return BadRequest(new { message = "Compte source introuvable." });

        // Vérifier le solde
        if (fromAccount.Balance < dto.Amount)
            return BadRequest(new { message = "Solde insuffisant." });

        // Trouver le compte destinataire par numéro
        var toAccount = await _context.Accounts
            .FirstOrDefaultAsync(a => a.AccountNumber == dto.ToAccountNumber_Str
                                   && a.IsActive);

        if (toAccount == null)
            return BadRequest(new { message = "Compte destinataire introuvable." });

        if (toAccount.AccountId == fromAccount.AccountId)
            return BadRequest(new { message = "Impossible de virer vers le même compte." });

        // Effectuer le virement (transaction atomique)
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            fromAccount.Balance -= dto.Amount;
            toAccount.Balance += dto.Amount;

            var t = new Transaction
            {
                FromAccountId = fromAccount.AccountId,
                ToAccountId = toAccount.AccountId,
                Amount = dto.Amount,
                TransactionType = "Virement",
                Description = dto.Description ?? $"Virement vers {toAccount.AccountNumber}",
                Status = "Completee"
            };

            _context.Transactions.Add(t);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // Notifier l'expéditeur
            await _notifService.NotifyAsync(
                userId,
                "Virement effectué",
                $"Vous avez envoyé {dto.Amount:N0} XAF vers le compte {toAccount.AccountNumber}.",
                "Virement"
            );

            // Notifier le destinataire
            await _notifService.NotifyAsync(
                toAccount.UserId,
                "Virement reçu",
                $"Vous avez reçu {dto.Amount:N0} XAF sur votre compte {toAccount.AccountNumber}.",
                "Virement"
            );

            return Ok(new { message = "Virement effectué avec succès.", transactionId = t.TransactionId });
        }
        catch
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { message = "Erreur lors du virement." });
        }
    }

    // POST api/transaction/deposit — dépôt (Admin uniquement)
    [HttpPost("deposit")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Deposit([FromBody] DepositDto dto)
    {
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.AccountNumber == dto.AccountNumber && a.IsActive);

        if (account == null)
            return NotFound(new { message = "Compte introuvable." });

        account.Balance += dto.Amount;

        _context.Transactions.Add(new Transaction
        {
            ToAccountId = account.AccountId,
            Amount = dto.Amount,
            TransactionType = "Depot",
            Description = dto.Description ?? "Dépôt",
            Status = "Completee"
        });

        await _context.SaveChangesAsync();
        return Ok(new { message = "Dépôt effectué.", newBalance = account.Balance });
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}

public class DepositDto
{
    public string AccountNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Description { get; set; }
}