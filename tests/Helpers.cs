using BDMS.Authentication;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Security.Claims;

namespace BDMS;

internal static class Helpers
{
    internal static ControllerContext GetControllerContextAdmin()
        => new() { HttpContext = new DefaultHttpContext().SetAdminClaimsPrincipal() };

    internal static HttpContext SetAdminClaimsPrincipal(this HttpContext httpContext)
        => httpContext.SetClaimsPrincipal("admin", PolicyNames.Admin);

    internal static HttpContext SetClaimsPrincipal(this HttpContext httpContext, string name, string role)
    {
        var adminClaims = new List<Claim>()
        {
           new Claim(ClaimTypes.Name, name),
           new Claim(ClaimTypes.Role, role),
        };

        var userIdentity = new ClaimsIdentity(adminClaims, "TestAuthType");
        httpContext.User = new ClaimsPrincipal(userIdentity);

        return httpContext;
    }

    internal static Borehole AddNewBoreholeToContext(this BdmsContext bdmsContext, Borehole boreholeToAdd)
    {
        bdmsContext.Boreholes.Add(boreholeToAdd);
        bdmsContext.SaveChanges();

        var borehole = bdmsContext.Boreholes.FirstOrDefault(b => b.Id == boreholeToAdd.Id);

        Assert.IsNotNull(borehole, $"No borehole found with id {boreholeToAdd.Id}.");

        return borehole;
    }

    internal static void RemoveBoreholeFromContext(this BdmsContext bdmsContext, Borehole? boreholeToRemove)
    {
        if (boreholeToRemove != null)
        {
            bdmsContext.Boreholes.Remove(boreholeToRemove);
            bdmsContext.SaveChanges();
        }
    }

    internal static void ResetChangesInContext(this BdmsContext bdmsContext)
    {
        var changedEntries = bdmsContext.ChangeTracker.Entries()
                .Where(x => x.State != EntityState.Unchanged).ToList();

        foreach (var entry in changedEntries)
        {
            switch (entry.State)
            {
                case EntityState.Modified:
                    entry.CurrentValues.SetValues(entry.OriginalValues);
                    entry.State = EntityState.Unchanged;
                    break;
                case EntityState.Added:
                    entry.State = EntityState.Detached;
                    break;
                case EntityState.Deleted:
                    entry.State = EntityState.Unchanged;
                    break;
            }
        }
    }
}
