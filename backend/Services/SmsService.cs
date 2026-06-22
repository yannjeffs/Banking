using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace backend.Services;

public class SmsService
{
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<SmsService> _logger;

    private string? _cachedToken;
    private DateTime _tokenExpiry = DateTime.MinValue;

    public SmsService(
        IConfiguration config,
        IHttpClientFactory httpClientFactory,
        ILogger<SmsService> logger)
    {
        _config = config;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    // ═══════════════════════════════════════
    // Récupère un access token OAuth2 (avec cache)
    // ═══════════════════════════════════════
    private async Task<string?> GetAccessTokenAsync()
    {
        // Réutiliser le token tant qu'il est valide
        if (_cachedToken != null && DateTime.UtcNow < _tokenExpiry)
            return _cachedToken;

        try
        {
            var clientId = _config["Sms:ClientId"];
            var clientSecret = _config["Sms:ClientSecret"];
            var tokenUrl = _config["Sms:TokenUrl"];

            var credentials = Convert.ToBase64String(
                Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}")
            );

            using var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Basic", credentials);

            var content = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("grant_type", "client_credentials")
            });

            var response = await client.PostAsync(tokenUrl, content);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogError("Échec récupération token Orange : {Error}", errorBody);
                return null;
            }

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            var token = doc.RootElement.GetProperty("access_token").GetString();
            var expiresIn = doc.RootElement.GetProperty("expires_in").GetInt32();

            _cachedToken = token;
            _tokenExpiry = DateTime.UtcNow.AddSeconds(expiresIn - 60); // marge de sécurité

            return token;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la récupération du token Orange SMS.");
            return null;
        }
    }

    // ═══════════════════════════════════════
    // Envoie un SMS à un numéro camerounais
    // ═══════════════════════════════════════
    public async Task<bool> SendSmsAsync(string toPhoneNumber, string message)
    {
        try
        {
            var token = await GetAccessTokenAsync();
            if (token == null)
            {
                _logger.LogWarning("Impossible d'envoyer le SMS : token Orange indisponible.");
                return false;
            }

            var senderAddress = _config["Sms:SenderAddress"];
            var smsUrlBase = _config["Sms:SmsUrlBase"];

            // Normaliser le numéro au format international tel:+237XXXXXXXXX
            var normalizedNumber = NormalizePhoneNumber(toPhoneNumber);

            var url = $"{smsUrlBase}/{Uri.EscapeDataString(senderAddress!)}/requests";

            var payload = new
            {
                outboundSMSMessageRequest = new
                {
                    address = $"tel:{normalizedNumber}",
                    senderAddress = senderAddress,
                    outboundSMSTextMessage = new { message },
                }
            };

            using var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", token);

            var jsonContent = JsonSerializer.Serialize(payload);
            var httpContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            var response = await client.PostAsync(url, httpContent);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogError("Échec envoi SMS Orange : {Error}", errorBody);
                return false;
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de l'envoi du SMS à {Number}", toPhoneNumber);
            return false;
        }
    }

    // ═══════════════════════════════════════
    // Normalise un numéro camerounais au format international
    // Accepte : 6XXXXXXXX, 06XXXXXXXX, +2376XXXXXXXX, 2376XXXXXXXX
    // ═══════════════════════════════════════
    private static string NormalizePhoneNumber(string phone)
    {
        var digits = new string(phone.Where(char.IsDigit).ToArray());

        if (digits.StartsWith("237") && digits.Length == 12)
            return "+" + digits;

        if (digits.Length == 9 && digits.StartsWith("6"))
            return "+237" + digits;

        if (digits.Length == 10 && digits.StartsWith("06"))
            return "+237" + digits[1..];

        // Fallback : retourne tel quel avec un + si absent
        return phone.StartsWith("+") ? phone : "+" + digits;
    }
}