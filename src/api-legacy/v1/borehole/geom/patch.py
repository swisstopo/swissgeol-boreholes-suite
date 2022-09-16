# -*- coding: utf-8 -*-
import traceback
from bms.v1.action import Action
from bms.v1.exceptions import (
    PatchAttributeException
)


class PatchGeom(Action):

    async def execute(self, id, field, value):
        try:
            # Updating character varing field
            if field in [
                'location',
                'location_x',
                'location_y'
                    ]:

                # Get currently inserted location
                location = await self.conn.fetchrow(
                    """
                        SELECT
                            location_x_bho,
                            location_y_bho,
                            code_cli
                        FROM
                            bdms.borehole
                        LEFT JOIN bdms.codelist
                        ON id_cli = srs_id_cli
                        WHERE
                            id_bho = $1
                    """, id
                )

                # If not complete remove geometry
                if (
                    location[0] is None or
                    location[1] is None or
                    location[2] is None
                        ):
                    await self.conn.execute("""
                        UPDATE bdms.borehole
                        SET geom_bho = NULL,
                            canton_bho = NULL,
                            city_bho = NULL
                        WHERE id_bho = $1
                    """, id)

                else:

                    point = "POINT(%s %s)"

                    if field == 'location':
                        point = point % (value[0], value[1])

                    elif field == 'location_x':
                        point = point % (value, location[1])

                    elif field == 'location_y':
                        point = point % (location[0], value)

                    # Get Canton and city id
                    geolocation = await self.conn.fetchval("""
                        SELECT
                            row_to_json(t)
                        FROM (
                            SELECT
                                cantons.kantonsnum as canton,
                                municipalities.gid as city
                            FROM
                                (
                                SELECT ST_SetSRID(
                                    ST_GeomFromText(
                                        $1
                                    ), %s
                                ) AS point
                            ) as g
                            LEFT JOIN
                                bdms.cantons
                            ON ST_Intersects(
                                g.point,
                                ST_Transform(
                                    ST_SetSRID(cantons.geom, 21781), %s
                                )
                            )
                            LEFT JOIN
                                bdms.municipalities
                            ON ST_Intersects(
                                g.point,
                                ST_Transform(
                                    ST_SetSRID(municipalities.geom, 21781), %s
                                )
                            )
                        ) AS t
                    """ % (
                        location[2], location[2], location[2]
                    ), point)

                    if geolocation is not None:
                        geolocation = self.decode(geolocation)

                    else:
                        geolocation = {
                            "canton": None,
                            "city": None
                        }

                    try:
                        if location[2] == '2056':
                            await self.conn.execute("""
                                    UPDATE bdms.borehole
                                    SET
                                        geom_bho = ST_GeomFromText('%s', $1),
                                        canton_bho = $3,
                                        city_bho = $4

                                    WHERE id_bho = $2
                                """ % point,
                                int(location[2]), id,
                                geolocation["canton"], 
                                geolocation["city"]
                            )
                            return geolocation
                        else:
                            await self.conn.execute("""
                                UPDATE bdms.borehole
                                SET geom_bho = ST_Transform(
                                    ST_GeomFromText('%s', $1),
                                    2056
                                )
                                WHERE id_bho = $2
                            """ % point, int(location[2]), id)

                    except Exception as e:
                        print(traceback.print_exc())

                    return None

            else:
                raise PatchAttributeException(field)

        except PatchAttributeException as bmsx:
            raise bmsx

        except Exception:
            raise Exception("Error while updating geometry column")
