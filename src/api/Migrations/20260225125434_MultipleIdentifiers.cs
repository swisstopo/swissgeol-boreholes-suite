using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BDMS.Migrations;
    /// <inheritdoc />
    public partial class MultipleIdentifiers : Migration
    {
        /// <inheritdoc />
       protected override void Up(MigrationBuilder migrationBuilder)
       {
           migrationBuilder.DropPrimaryKey(
               name: "PK_borehole_identifiers_codelist",
               schema: "bdms",
               table: "borehole_identifiers_codelist");

           migrationBuilder.AddColumn<int>(
               name: "id",
               schema: "bdms",
               table: "borehole_identifiers_codelist",
               type: "integer",
               nullable: false)
               .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

           // Populate existing rows with unique IDs
           migrationBuilder.Sql(@"
               WITH numbered_rows AS (
                   SELECT ctid, ROW_NUMBER() OVER (ORDER BY borehole_id, identifier_id) as rn
                   FROM bdms.borehole_identifiers_codelist
               )
               UPDATE bdms.borehole_identifiers_codelist
               SET id = numbered_rows.rn
               FROM numbered_rows
               WHERE bdms.borehole_identifiers_codelist.ctid = numbered_rows.ctid;

               SELECT setval('bdms.borehole_identifiers_codelist_id_seq',
                   COALESCE((SELECT MAX(id) FROM bdms.borehole_identifiers_codelist), 0) + 1,
                   false);
           ");

           migrationBuilder.AddPrimaryKey(
               name: "PK_borehole_identifiers_codelist",
               schema: "bdms",
               table: "borehole_identifiers_codelist",
               column: "id");

           migrationBuilder.CreateIndex(
               name: "IX_borehole_identifiers_codelist_borehole_id",
               schema: "bdms",
               table: "borehole_identifiers_codelist",
               column: "borehole_id");
       }
    }
