using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Services;

public class NotificationService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;
    private readonly ILogger<NotificationService> _logger;
    private readonly SmsService _smsService;

    public NotificationService(
        AppDbContext context,
        IConfiguration config,
        ILogger<NotificationService> logger,
        SmsService smsService)
    {
        _context = context;
        _config = config;
        _logger = logger;
        _smsService = smsService;
    }

    // ═══════════════════════════════════════
    // Méthode principale : notifie un utilisateur
    // (in-app + email automatiquement + SMS)
    // ═══════════════════════════════════════
    public async Task NotifyAsync(
        int userId,
        string title,
        string message,
        string type,
        bool sendEmail = true,
        bool sendSms = true)
    {
        // 1. Notification in-app
        var notification = new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
        };
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        // 2. Récupérer l'utilisateur une seule fois
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return;

        // 3. Email
        if (sendEmail)
        {
            await SendEmailAsync(user.Email, user.FirstName, title, message);
        }

        // 4. SMS
        if (sendSms && !string.IsNullOrWhiteSpace(user.Phone))
        {
            var smsText = $"{title} - {message}";
            // Limiter à 160 caractères (norme SMS standard)
            if (smsText.Length > 160)
                smsText = smsText[..157] + "...";

            await _smsService.SendSmsAsync(user.Phone, smsText);
        }
    }

    // ═══════════════════════════════════════
    // Envoi d'email via Mailtrap (SMTP)
    // ═══════════════════════════════════════
    private async Task SendEmailAsync(string toEmail, string toName, string subject, string body)
    {
        try
        {
            var fromName = _config["Email:FromName"] ?? "E-Banking";
            var fromEmail = _config["Email:FromEmail"] ?? "no-reply@ebanking.cm";
            var host = _config["Email:Host"] ?? "sandbox.smtp.mailtrap.io";
            var port = int.Parse(_config["Email:Port"] ?? "2525");
            var username = _config["Email:Username"] ?? string.Empty;
            var password = _config["Email:Password"] ?? string.Empty;

            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(fromName, fromEmail));
            email.To.Add(new MailboxAddress(toName, toEmail));
            email.Subject = subject;

            email.Body = new TextPart("html")
            {
                Text = BuildEmailHtml(subject, body, toName)
            };

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(host, port, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(username, password);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }
        catch (Exception ex)
        {
            // On log l'erreur mais ne bloque pas une opération bancaire
            // à cause d'un email qui n'arrive pas
            _logger.LogError(ex, "Échec de l'envoi d'email à {Email}", toEmail);
        }
    }

    // ═══════════════════════════════════════
    // Template HTML simple pour l'email
    // ═══════════════════════════════════════
    private static string BuildEmailHtml(string title, string message, string firstName)
    {
        return $@"
        <div style='font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;'>
            <div style='background: #1a56db; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;'>
                <h1 style='color: #fff; margin: 0; font-size: 20px;'>🏛 E-Banking</h1>
            </div>
            <div style='background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;'>
                <p style='color: #374151; font-size: 15px;'>Bonjour {firstName},</p>
                <h2 style='color: #1e3a5f; font-size: 18px; margin-top: 16px;'>{title}</h2>
                <p style='color: #4b5563; font-size: 14px; line-height: 1.6;'>{message}</p>
                <hr style='border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;' />
                <p style='color: #9ca3af; font-size: 12px;'>
                    Ceci est une notification automatique. Merci de ne pas répondre à cet email.
                </p>
            </div>
        </div>";
    }

    // ═══════════════════════════════════════
    // Récupérer les notifications d'un utilisateur
    // ═══════════════════════════════════════
    public async Task<List<Notification>> GetUserNotificationsAsync(int userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync();
    }

    public async Task<int> GetUnreadCountAsync(int userId)
    {
        return await _context.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead);
    }

    public async Task MarkAsReadAsync(int notificationId, int userId)
    {
        var notif = await _context.Notifications
            .FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.UserId == userId);
        if (notif != null)
        {
            notif.IsRead = true;
            await _context.SaveChangesAsync();
        }
    }

    public async Task MarkAllAsReadAsync(int userId)
    {
        var notifs = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();
        foreach (var n in notifs) n.IsRead = true;
        await _context.SaveChangesAsync();
    }
}