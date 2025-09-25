using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class MigrateStratigraphyLayers : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Migrate lithological descriptions
        migrationBuilder.DropForeignKey(
            name: "FK_lithological_description_stratigraphy_id_sty_fk",
            schema: "bdms",
            table: "lithological_description");

        migrationBuilder.RenameColumn(
            name: "id_ldp",
            schema: "bdms",
            table: "lithological_description",
            newName: "id");

        migrationBuilder.RenameColumn(
            name: "id_sty_fk",
            schema: "bdms",
            table: "lithological_description",
            newName: "stratigraphy_id");

        migrationBuilder.RenameIndex(
            name: "IX_lithological_description_id_sty_fk",
            schema: "bdms",
            table: "lithological_description",
            newName: "IX_lithological_description_stratigraphy_id");

        migrationBuilder.AlterColumn<double>(
            name: "depth_to",
            schema: "bdms",
            table: "lithological_description",
            type: "double precision",
            nullable: false,
            defaultValue: 0.0,
            oldClrType: typeof(double),
            oldType: "double precision",
            oldNullable: true);

        migrationBuilder.AlterColumn<double>(
            name: "depth_from",
            schema: "bdms",
            table: "lithological_description",
            type: "double precision",
            nullable: false,
            defaultValue: 0.0,
            oldClrType: typeof(double),
            oldType: "double precision",
            oldNullable: true);

        migrationBuilder.AddForeignKey(
            name: "FK_lithological_description_stratigraphy_v2_stratigraphy_id",
            schema: "bdms",
            table: "lithological_description",
            column: "stratigraphy_id",
            principalSchema: "bdms",
            principalTable: "stratigraphy_v2",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        // Migrate facies descriptions
        migrationBuilder.DropForeignKey(
            name: "FK_facies_description_stratigraphy_id_sty_fk",
            schema: "bdms",
            table: "facies_description");

        migrationBuilder.RenameColumn(
            name: "id_fac",
            schema: "bdms",
            table: "facies_description",
            newName: "id");

        migrationBuilder.RenameColumn(
            name: "id_sty_fk",
            schema: "bdms",
            table: "facies_description",
            newName: "stratigraphy_id");

        migrationBuilder.RenameIndex(
            name: "IX_facies_description_id_sty_fk",
            schema: "bdms",
            table: "facies_description",
            newName: "IX_facies_description_stratigraphy_id");

        migrationBuilder.AlterColumn<double>(
            name: "depth_to",
            schema: "bdms",
            table: "facies_description",
            type: "double precision",
            nullable: false,
            defaultValue: 0.0,
            oldClrType: typeof(double),
            oldType: "double precision",
            oldNullable: true);

        migrationBuilder.AlterColumn<double>(
            name: "depth_from",
            schema: "bdms",
            table: "facies_description",
            type: "double precision",
            nullable: false,
            defaultValue: 0.0,
            oldClrType: typeof(double),
            oldType: "double precision",
            oldNullable: true);

        migrationBuilder.AddForeignKey(
            name: "FK_facies_description_stratigraphy_v2_stratigraphy_id",
            schema: "bdms",
            table: "facies_description",
            column: "stratigraphy_id",
            principalSchema: "bdms",
            principalTable: "stratigraphy_v2",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        // Migrate chronostratigraphy
        migrationBuilder.DropForeignKey(
            name: "FK_chronostratigraphy_stratigraphy_id_sty_fk",
            schema: "bdms",
            table: "chronostratigraphy");

        migrationBuilder.RenameColumn(
            name: "id_chr",
            schema: "bdms",
            table: "chronostratigraphy",
            newName: "id");

        migrationBuilder.RenameColumn(
            name: "id_sty_fk",
            schema: "bdms",
            table: "chronostratigraphy",
            newName: "stratigraphy_id");

        migrationBuilder.RenameIndex(
            name: "IX_chronostratigraphy_id_sty_fk",
            schema: "bdms",
            table: "chronostratigraphy",
            newName: "IX_chronostratigraphy_stratigraphy_id");

        migrationBuilder.AlterColumn<double>(
            name: "depth_to",
            schema: "bdms",
            table: "chronostratigraphy",
            type: "double precision",
            nullable: true,
            defaultValue: 0.0,
            oldClrType: typeof(double),
            oldType: "double precision",
            oldNullable: true);

        migrationBuilder.AlterColumn<double>(
            name: "depth_from",
            schema: "bdms",
            table: "chronostratigraphy",
            type: "double precision",
            nullable: true,
            defaultValue: 0.0,
            oldClrType: typeof(double),
            oldType: "double precision",
            oldNullable: true);

        migrationBuilder.AddForeignKey(
            name: "FK_chronostratigraphy_stratigraphy_v2_stratigraphy_id",
            schema: "bdms",
            table: "chronostratigraphy",
            column: "stratigraphy_id",
            principalSchema: "bdms",
            principalTable: "stratigraphy_v2",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);

        // Migrate lithostratigraphy
        migrationBuilder.DropForeignKey(
            name: "FK_lithostratigraphy_stratigraphy_stratigraphy_id",
            schema: "bdms",
            table: "lithostratigraphy");

        migrationBuilder.AlterColumn<double>(
            name: "depth_to",
            schema: "bdms",
            table: "lithostratigraphy",
            type: "double precision",
            nullable: false,
            defaultValue: 0.0,
            oldClrType: typeof(double),
            oldType: "double precision",
            oldNullable: true);

        migrationBuilder.AlterColumn<double>(
            name: "depth_from",
            schema: "bdms",
            table: "lithostratigraphy",
            type: "double precision",
            nullable: false,
            defaultValue: 0.0,
            oldClrType: typeof(double),
            oldType: "double precision",
            oldNullable: true);

        migrationBuilder.AddForeignKey(
            name: "FK_lithostratigraphy_stratigraphy_v2_stratigraphy_id",
            schema: "bdms",
            table: "lithostratigraphy",
            column: "stratigraphy_id",
            principalSchema: "bdms",
            principalTable: "stratigraphy_v2",
            principalColumn: "id",
            onDelete: ReferentialAction.Cascade);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_chronostratigraphy_stratigraphy_v2_stratigraphy_id",
            schema: "bdms",
            table: "chronostratigraphy");

        migrationBuilder.DropForeignKey(
            name: "FK_facies_description_stratigraphy_v2_stratigraphy_id",
            schema: "bdms",
            table: "facies_description");

        migrationBuilder.DropForeignKey(
            name: "FK_lithological_description_stratigraphy_v2_stratigraphy_id",
            schema: "bdms",
            table: "lithological_description");

        migrationBuilder.DropForeignKey(
            name: "FK_lithostratigraphy_stratigraphy_v2_stratigraphy_id",
            schema: "bdms",
            table: "lithostratigraphy");

        migrationBuilder.RenameColumn(
            name: "stratigraphy_id",
            schema: "bdms",
            table: "lithological_description",
            newName: "id_sty_fk");

        migrationBuilder.RenameColumn(
            name: "id",
            schema: "bdms",
            table: "lithological_description",
            newName: "id_ldp");

        migrationBuilder.RenameIndex(
            name: "IX_lithological_description_stratigraphy_id",
            schema: "bdms",
            table: "lithological_description",
            newName: "IX_lithological_description_id_sty_fk");

        migrationBuilder.RenameColumn(
            name: "stratigraphy_id",
            schema: "bdms",
            table: "facies_description",
            newName: "id_sty_fk");

        migrationBuilder.RenameColumn(
            name: "id",
            schema: "bdms",
            table: "facies_description",
            newName: "id_fac");

        migrationBuilder.RenameIndex(
            name: "IX_facies_description_stratigraphy_id",
            schema: "bdms",
            table: "facies_description",
            newName: "IX_facies_description_id_sty_fk");

        migrationBuilder.RenameColumn(
            name: "stratigraphy_id",
            schema: "bdms",
            table: "chronostratigraphy",
            newName: "id_sty_fk");

        migrationBuilder.RenameColumn(
            name: "id",
            schema: "bdms",
            table: "chronostratigraphy",
            newName: "id_chr");

        migrationBuilder.RenameIndex(
            name: "IX_chronostratigraphy_stratigraphy_id",
            schema: "bdms",
            table: "chronostratigraphy",
            newName: "IX_chronostratigraphy_id_sty_fk");

        migrationBuilder.AlterColumn<double>(
            name: "depth_to",
            schema: "bdms",
            table: "lithostratigraphy",
            type: "double precision",
            nullable: true,
            oldClrType: typeof(double),
            oldType: "double precision");

        migrationBuilder.AlterColumn<double>(
            name: "depth_from",
            schema: "bdms",
            table: "lithostratigraphy",
            type: "double precision",
            nullable: true,
            oldClrType: typeof(double),
            oldType: "double precision");

        migrationBuilder.AlterColumn<double>(
            name: "depth_to",
            schema: "bdms",
            table: "lithological_description",
            type: "double precision",
            nullable: true,
            oldClrType: typeof(double),
            oldType: "double precision");

        migrationBuilder.AlterColumn<double>(
            name: "depth_from",
            schema: "bdms",
            table: "lithological_description",
            type: "double precision",
            nullable: true,
            oldClrType: typeof(double),
            oldType: "double precision");

        migrationBuilder.AlterColumn<double>(
            name: "depth_to",
            schema: "bdms",
            table: "facies_description",
            type: "double precision",
            nullable: true,
            oldClrType: typeof(double),
            oldType: "double precision");

        migrationBuilder.AlterColumn<double>(
            name: "depth_from",
            schema: "bdms",
            table: "facies_description",
            type: "double precision",
            nullable: true,
            oldClrType: typeof(double),
            oldType: "double precision");

        migrationBuilder.AlterColumn<double>(
            name: "depth_to",
            schema: "bdms",
            table: "chronostratigraphy",
            type: "double precision",
            nullable: true,
            oldClrType: typeof(double),
            oldType: "double precision");

        migrationBuilder.AlterColumn<double>(
            name: "depth_from",
            schema: "bdms",
            table: "chronostratigraphy",
            type: "double precision",
            nullable: true,
            oldClrType: typeof(double),
            oldType: "double precision");

        migrationBuilder.AddForeignKey(
            name: "FK_chronostratigraphy_stratigraphy_id_sty_fk",
            schema: "bdms",
            table: "chronostratigraphy",
            column: "id_sty_fk",
            principalSchema: "bdms",
            principalTable: "stratigraphy",
            principalColumn: "id_sty",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_facies_description_stratigraphy_id_sty_fk",
            schema: "bdms",
            table: "facies_description",
            column: "id_sty_fk",
            principalSchema: "bdms",
            principalTable: "stratigraphy",
            principalColumn: "id_sty",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_lithological_description_stratigraphy_id_sty_fk",
            schema: "bdms",
            table: "lithological_description",
            column: "id_sty_fk",
            principalSchema: "bdms",
            principalTable: "stratigraphy",
            principalColumn: "id_sty",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_lithostratigraphy_stratigraphy_stratigraphy_id",
            schema: "bdms",
            table: "lithostratigraphy",
            column: "stratigraphy_id",
            principalSchema: "bdms",
            principalTable: "stratigraphy",
            principalColumn: "id_sty",
            onDelete: ReferentialAction.Cascade);
    }
}
#pragma warning restore CA1505
