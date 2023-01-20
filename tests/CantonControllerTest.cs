﻿using BDMS.Authentication;
using BDMS.Controllers;
using BDMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace BDMS;

[TestClass]
public class CantonControllerTest
{
    private const string TestCanton = "Z283$gVa2%ym8sf3h#X5grPB$^M";

    private BdmsContext context;
    private CantonController controller;

    private int boreholeCount;

    [TestInitialize]
    public void TestInitialize()
    {
        context = ContextFactory.CreateContext();
        controller = new CantonController(context);
        controller.ControllerContext.HttpContext = new DefaultHttpContext();

        boreholeCount = context.Boreholes.Count();
    }

    [TestCleanup]
    public async Task TestCleanup()
    {
        Assert.AreEqual(boreholeCount, context.Boreholes.Count(), "Tests need to remove boreholes they created.");
        await context.DisposeAsync();
    }

    [TestMethod]
    public async Task GetAllAsync()
    {
        var initialAvailableCantons = (await controller.GetAllAsync()).ToList();
        CollectionAssert.AllItemsAreNotNull(initialAvailableCantons);
        CollectionAssert.AllItemsAreUnique(initialAvailableCantons);
        CollectionAssert.DoesNotContain(initialAvailableCantons, TestCanton);

        var borehole1 = new Borehole() { Canton = TestCanton };
        var borehole2 = new Borehole() { Canton = TestCanton };
        context.Boreholes.Add(borehole1);
        context.Boreholes.Add(borehole2);
        context.SaveChanges();

        var updatedCantons = (await controller.GetAllAsync()).ToList();
        CollectionAssert.AllItemsAreNotNull(updatedCantons);
        CollectionAssert.AllItemsAreUnique(updatedCantons);
        CollectionAssert.Contains(updatedCantons, TestCanton);

        context.Boreholes.Remove(borehole1);
        context.Boreholes.Remove(borehole2);
        context.SaveChanges();
    }
}
