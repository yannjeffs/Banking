using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Account> Accounts { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<Loan> Loans { get; set; }
    public DbSet<LoanPayment> LoanPayments { get; set; }
    public DbSet<Notification> Notifications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Transaction : deux FK vers Accounts (évite les conflits de cascade)
        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.FromAccount)
            .WithMany(a => a.OutgoingTransactions)
            .HasForeignKey(t => t.FromAccountId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Transaction>()
            .HasOne(t => t.ToAccount)
            .WithMany(a => a.IncomingTransactions)
            .HasForeignKey(t => t.ToAccountId)
            .OnDelete(DeleteBehavior.Restrict);

        // Précisions décimales
        modelBuilder.Entity<Account>()
            .Property(a => a.Balance).HasPrecision(18, 2);
        modelBuilder.Entity<Transaction>()
            .Property(t => t.Amount).HasPrecision(18, 2);
        modelBuilder.Entity<Loan>()
            .Property(l => l.Amount).HasPrecision(18, 2);
        modelBuilder.Entity<Loan>()
            .Property(l => l.InterestRate).HasPrecision(5, 2);
        modelBuilder.Entity<Loan>()
            .Property(l => l.MonthlyPayment).HasPrecision(18, 2);
        modelBuilder.Entity<LoanPayment>()
            .Property(p => p.Amount).HasPrecision(18, 2);
        modelBuilder.Entity<LoanPayment>()
            .Property(p => p.RemainingBalance).HasPrecision(18, 2);
        modelBuilder.Entity<LoanPayment>()
            .Property(p => p.PrincipalPaid).HasPrecision(18, 2);
        modelBuilder.Entity<LoanPayment>()
            .Property(p => p.InterestPaid).HasPrecision(18, 2);
    }
}