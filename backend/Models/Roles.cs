namespace backend.Models;

public static class Roles
{
    public const string Admin = "Admin";
    public const string Superviseur = "Superviseur";
    public const string GestionnaireComptes = "GestionnaireComptes";
    public const string AgentCredit = "AgentCredit";
    public const string Caissier = "Caissier";
    public const string Auditeur = "Auditeur";
    public const string Client = "Client";

    // Groupes de rôles pour les attributs [Authorize]
    public const string StaffRoles =
        "Admin,Superviseur,GestionnaireComptes,AgentCredit,Caissier,Auditeur";

    public const string CanManageAccounts =
        "Admin,GestionnaireComptes";

    public const string CanManageLoans =
        "Admin,AgentCredit";

    public const string CanDeposit =
        "Admin,Caissier";

    public const string CanViewAll =
        "Admin,Superviseur,Auditeur";

    public const string CanAssignRoles =
        "Admin,Superviseur";
}