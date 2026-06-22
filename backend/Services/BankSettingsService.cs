using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Services;

public class BankSettingsService
{
    private readonly AppDbContext _context;

    public BankSettingsService(AppDbContext context)
    {
        _context = context;
    }

    // Récupérer une valeur par clé
    public async Task<string?> GetAsync(string key)
    {
        var setting = await _context.BankSettings
            .FirstOrDefaultAsync(s => s.SettingKey == key);
        return setting?.SettingValue;
    }

    // Récupérer une valeur décimale avec valeur par défaut
    public async Task<decimal> GetDecimalAsync(string key, decimal defaultValue = 0)
    {
        var value = await GetAsync(key);
        return decimal.TryParse(value, out var result) ? result : defaultValue;
    }

    // Récupérer une valeur entière avec valeur par défaut
    public async Task<int> GetIntAsync(string key, int defaultValue = 0)
    {
        var value = await GetAsync(key);
        return int.TryParse(value, out var result) ? result : defaultValue;
    }

    // Mettre à jour une valeur
    public async Task<bool> UpdateAsync(string key, string value)
    {
        var setting = await _context.BankSettings
            .FirstOrDefaultAsync(s => s.SettingKey == key);

        if (setting == null) return false;

        setting.SettingValue = value;
        setting.UpdatedAt    = DateTime.Now;
        await _context.SaveChangesAsync();
        return true;
    }

    // Récupérer tous les paramètres
    public async Task<List<BankSetting>> GetAllAsync()
    {
        return await _context.BankSettings
            .OrderBy(s => s.SettingKey)
            .ToListAsync();
    }
}