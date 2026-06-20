using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly NotificationService _notifService;

    public NotificationController(NotificationService notifService)
    {
        _notifService = notifService;
    }

    // GET api/notification
    [HttpGet]
    public async Task<IActionResult> GetMyNotifications()
    {
        var userId = GetUserId();
        var notifs = await _notifService.GetUserNotificationsAsync(userId);
        return Ok(notifs);
    }

    // GET api/notification/unread-count
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = GetUserId();
        var count  = await _notifService.GetUnreadCountAsync(userId);
        return Ok(new { count });
    }

    // PUT api/notification/{id}/read
    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var userId = GetUserId();
        await _notifService.MarkAsReadAsync(id, userId);
        return Ok(new { message = "Notification marquée comme lue." });
    }

    // PUT api/notification/read-all
    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = GetUserId();
        await _notifService.MarkAllAsReadAsync(userId);
        return Ok(new { message = "Toutes les notifications ont été marquées comme lues." });
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}