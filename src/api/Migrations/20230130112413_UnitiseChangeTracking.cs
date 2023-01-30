using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class UnitiseChangeTracking : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_facies_description_users_creator",
            schema: "bdms",
            table: "facies_description");

        migrationBuilder.DropForeignKey(
            name: "FK_facies_description_users_updater",
            schema: "bdms",
            table: "facies_description");

        migrationBuilder.DropForeignKey(
            name: "FK_layer_users_creator_lay",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropForeignKey(
            name: "FK_layer_users_updater_lay",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropForeignKey(
            name: "FK_lithological_description_users_creator",
            schema: "bdms",
            table: "lithological_description");

        migrationBuilder.DropForeignKey(
            name: "FK_lithological_description_users_updater",
            schema: "bdms",
            table: "lithological_description");

        migrationBuilder.AlterColumn<int>(
            name: "updater",
            schema: "bdms",
            table: "lithological_description",
            type: "integer",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "integer");

        migrationBuilder.AlterColumn<int>(
            name: "creator",
            schema: "bdms",
            table: "lithological_description",
            type: "integer",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "integer");

        migrationBuilder.AlterColumn<int>(
            name: "updater_lay",
            schema: "bdms",
            table: "layer",
            type: "integer",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "integer");

        migrationBuilder.AlterColumn<int>(
            name: "creator_lay",
            schema: "bdms",
            table: "layer",
            type: "integer",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "integer");

        migrationBuilder.AddColumn<int>(
            name: "updated_by_fil",
            schema: "bdms",
            table: "files",
            type: "integer",
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "updated_fil",
            schema: "bdms",
            table: "files",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AlterColumn<int>(
            name: "updater",
            schema: "bdms",
            table: "facies_description",
            type: "integer",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "integer");

        migrationBuilder.AlterColumn<int>(
            name: "creator",
            schema: "bdms",
            table: "facies_description",
            type: "integer",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "integer");

        migrationBuilder.AddColumn<DateTime>(
            name: "created_bfi",
            schema: "bdms",
            table: "borehole_files",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "created_by_bfi",
            schema: "bdms",
            table: "borehole_files",
            type: "integer",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_files_updated_by_fil",
            schema: "bdms",
            table: "files",
            column: "updated_by_fil");

        migrationBuilder.CreateIndex(
            name: "IX_borehole_files_created_by_bfi",
            schema: "bdms",
            table: "borehole_files",
            column: "created_by_bfi");

        migrationBuilder.AddForeignKey(
            name: "FK_borehole_files_users_created_by_bfi",
            schema: "bdms",
            table: "borehole_files",
            column: "created_by_bfi",
            principalSchema: "bdms",
            principalTable: "users",
            principalColumn: "id_usr");

        migrationBuilder.AddForeignKey(
            name: "FK_facies_description_users_creator",
            schema: "bdms",
            table: "facies_description",
            column: "creator",
            principalSchema: "bdms",
            principalTable: "users",
            principalColumn: "id_usr");

        migrationBuilder.AddForeignKey(
            name: "FK_facies_description_users_updater",
            schema: "bdms",
            table: "facies_description",
            column: "updater",
            principalSchema: "bdms",
            principalTable: "users",
            principalColumn: "id_usr");

        migrationBuilder.AddForeignKey(
            name: "FK_files_users_updated_by_fil",
            schema: "bdms",
            table: "files",
            column: "updated_by_fil",
            principalSchema: "bdms",
            principalTable: "users",
            principalColumn: "id_usr");

        migrationBuilder.AddForeignKey(
            name: "FK_layer_users_creator_lay",
            schema: "bdms",
            table: "layer",
            column: "creator_lay",
            principalSchema: "bdms",
            principalTable: "users",
            principalColumn: "id_usr");

        migrationBuilder.AddForeignKey(
            name: "FK_layer_users_updater_lay",
            schema: "bdms",
            table: "layer",
            column: "updater_lay",
            principalSchema: "bdms",
            principalTable: "users",
            principalColumn: "id_usr");

        migrationBuilder.AddForeignKey(
            name: "FK_lithological_description_users_creator",
            schema: "bdms",
            table: "lithological_description",
            column: "creator",
            principalSchema: "bdms",
            principalTable: "users",
            principalColumn: "id_usr");

        migrationBuilder.AddForeignKey(
            name: "FK_lithological_description_users_updater",
            schema: "bdms",
            table: "lithological_description",
            column: "updater",
            principalSchema: "bdms",
            principalTable: "users",
            principalColumn: "id_usr");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_borehole_files_users_created_by_bfi",
            schema: "bdms",
            table: "borehole_files");

        migrationBuilder.DropForeignKey(
            name: "FK_facies_description_users_creator",
            schema: "bdms",
            table: "facies_description");

        migrationBuilder.DropForeignKey(
            name: "FK_facies_description_users_updater",
            schema: "bdms",
            table: "facies_description");

        migrationBuilder.DropForeignKey(
            name: "FK_files_users_updated_by_fil",
            schema: "bdms",
            table: "files");

        migrationBuilder.DropForeignKey(
            name: "FK_layer_users_creator_lay",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropForeignKey(
            name: "FK_layer_users_updater_lay",
            schema: "bdms",
            table: "layer");

        migrationBuilder.DropForeignKey(
            name: "FK_lithological_description_users_creator",
            schema: "bdms",
            table: "lithological_description");

        migrationBuilder.DropForeignKey(
            name: "FK_lithological_description_users_updater",
            schema: "bdms",
            table: "lithological_description");

        migrationBuilder.DropIndex(
            name: "IX_files_updated_by_fil",
            schema: "bdms",
            table: "files");

        migrationBuilder.DropIndex(
            name: "IX_borehole_files_created_by_bfi",
            schema: "bdms",
            table: "borehole_files");

        migrationBuilder.DropColumn(
            name: "updated_by_fil",
            schema: "bdms",
            table: "files");

        migrationBuilder.DropColumn(
            name: "updated_fil",
            schema: "bdms",
            table: "files");

        migrationBuilder.DropColumn(
            name: "created_bfi",
            schema: "bdms",
            table: "borehole_files");

        migrationBuilder.DropColumn(
            name: "created_by_bfi",
            schema: "bdms",
            table: "borehole_files");

        migrationBuilder.AlterColumn<int>(
            name: "updater",
            schema: "bdms",
            table: "lithological_description",
            type: "integer",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(int),
            oldType: "integer",
            oldNullable: true);

        migrationBuilder.AlterColumn<int>(
            name: "creator",
            schema: "bdms",
            table: "lithological_description",
            type: "integer",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(int),
            oldType: "integer",
            oldNullable: true);

        migrationBuilder.AlterColumn<int>(
            name: "updater_lay",
            schema: "bdms",
            table: "layer",
            type: "integer",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(int),
            oldType: "integer",
            oldNullable: true);

        migrationBuilder.AlterColumn<int>(
            name: "creator_lay",
            schema: "bdms",
            table: "layer",
            type: "integer",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(int),
            oldType: "integer",
            oldNullable: true);

        migrationBuilder.AlterColumn<int>(
            name: "updater",
            schema: "bdms",
            table: "facies_description",
            type: "integer",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(int),
            oldType: "integer",
            oldNullable: true);

        migrationBuilder.AlterColumn<int>(
            name: "creator",
            schema: "bdms",
            table: "facies_description",
            type: "integer",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(int),
            oldType: "integer",
            oldNullable: true);

        migrationBuilder.AddForeignKey(
            name: "FK_facies_description_users_creator",
            schema: "bdms",
            table: "facies_description",
            column: "creator",
            principalSchema: "bdms",
            principalTable: "users",
            principalColumn: "id_usr",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_facies_description_users_updater",
            schema: "bdms",
            table: "facies_description",
            column: "updater",
            principalSchema: "bdms",
            principalTable: "users",
            principalColumn: "id_usr",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_layer_users_creator_lay",
            schema: "bdms",
            table: "layer",
            column: "creator_lay",
            principalSchema: "bdms",
            principalTable: "users",
            principalColumn: "id_usr",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_layer_users_updater_lay",
            schema: "bdms",
            table: "layer",
            column: "updater_lay",
            principalSchema: "bdms",
            principalTable: "users",
            principalColumn: "id_usr",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_lithological_description_users_creator",
            schema: "bdms",
            table: "lithological_description",
            column: "creator",
            principalSchema: "bdms",
            principalTable: "users",
            principalColumn: "id_usr",
            onDelete: ReferentialAction.Cascade);

        migrationBuilder.AddForeignKey(
            name: "FK_lithological_description_users_updater",
            schema: "bdms",
            table: "lithological_description",
            column: "updater",
            principalSchema: "bdms",
            principalTable: "users",
            principalColumn: "id_usr",
            onDelete: ReferentialAction.Cascade);
    }
}
