﻿using BDMS.Authentication;
using BDMS.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Security.Claims;

namespace BDMS;

[TestClass]
public class AuthenticationTest
{
    private BdmsContext context;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.GetTestContext();
    }

    [TestCleanup]
    public async Task TestCleanup() => await context.DisposeAsync();

    [TestMethod]
    [DataRow(null, "email_verified", "true", DisplayName = "Missing Email Claim")]
    [DataRow("test@example.com", "email_verified", null, DisplayName = "Missing Email Verified Claim")]
    [DataRow("test@example.com", "email_verified", "false", DisplayName = "Email Not Verified")]
    public async Task CreateOrUpdateUser_ShouldThrowException_ForInvalidEmailClaims(string email, string emailVerifiedClaimType, string emailVerifiedClaimValue)
    {
        var user = new User
        {
            SubjectId = "12345",
            FirstName = "RED",
            LastName = "RABBIT",
            Name = "REDRABBIT",
            Email = "RABBIT@example.com",
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();

        var claims = new List<Claim>{ new Claim(ClaimTypes.NameIdentifier, "12345") };

        if (email != null)
            claims.Add(new Claim(ClaimTypes.Email, email));

        if (emailVerifiedClaimType != null && emailVerifiedClaimValue != null) claims.Add(new Claim(emailVerifiedClaimType, emailVerifiedClaimValue));

        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuthentication"));
        var transformation = new DatabaseAuthenticationClaimsTransformation(context);


        await Assert.ThrowsExceptionAsync<InvalidOperationException>(
            () => transformation.CreateOrUpdateUser(principal));
    }

    [TestMethod]
    public async Task CreateOrUpdateUser_ShouldCreateUser_WhenUserDoesNotExist()
    {
        var subjectId = "12345";
        var givenName = "WHITE";
        var surName = "MANGO";
        var email = "test@example.com";

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, subjectId),
            new Claim(ClaimTypes.GivenName, givenName),
            new Claim(ClaimTypes.Surname, surName),
            new Claim(ClaimTypes.Email, email),
            new Claim("email_verified", "true"),
        };

        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuthentication"));
        var transformation = new DatabaseAuthenticationClaimsTransformation(context);

        var user = await transformation.CreateOrUpdateUser(principal);

        Assert.IsNotNull(user);
        Assert.AreEqual(givenName, user.FirstName);
        Assert.AreEqual(surName, user.LastName);
        Assert.AreEqual($"{givenName[0]}. {surName}", user.Name);
        Assert.AreEqual(email, user.Email);
    }

    [TestMethod]
    public async Task CreateOrUpdateUser_ShouldUpdateUser_WhenUserExists()
    {
        var user = new User
        {
            SubjectId = "12345",
            FirstName = "RED",
            LastName = "RABBIT",
            Name = "REDRABBIT",
            Email = "RABBIT@example.com",
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();

        var givenName = "WHITE";
        var surName = "MANGO";
        var email = "WHITEMANGO@example.com";

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.SubjectId),
            new Claim(ClaimTypes.GivenName, givenName),
            new Claim(ClaimTypes.Surname, surName),
            new Claim(ClaimTypes.Email, email),
            new Claim("email_verified", "true"),
        };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuthentication"));

        var transformation = new DatabaseAuthenticationClaimsTransformation(context);

        var updatedUser = await transformation.CreateOrUpdateUser(principal);

        Assert.IsNotNull(updatedUser);
        Assert.AreEqual(user.Id, updatedUser.Id);
        Assert.AreEqual(givenName, updatedUser.FirstName);
        Assert.AreEqual(surName, updatedUser.LastName);
        Assert.AreEqual($"{givenName[0]}. {surName}", updatedUser.Name);
        Assert.AreEqual(email, updatedUser.Email);
    }

    [TestMethod]
    public async Task CreateOrUpdateUser_ShouldThrowException_WhenUserDoesNotExist_AndMissingGivenNameClaim()
    {
        var subjectId = "12345";
        var surName = "WHITE";

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, subjectId),
            new Claim(ClaimTypes.Surname, surName),
        };

        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuthentication"));
        var transformation = new DatabaseAuthenticationClaimsTransformation(context);

        await Assert.ThrowsExceptionAsync<NullReferenceException>(
            () => transformation.CreateOrUpdateUser(principal));
    }
}
