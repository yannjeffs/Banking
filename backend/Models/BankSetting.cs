using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class BankSetting
{
    [Key]
    public int SettingId { get; set; }
    public string SettingKey { get; set; } = string.Empty;
    public string SettingValue { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
}