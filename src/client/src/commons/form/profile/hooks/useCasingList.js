import React, { useState, useEffect, useRef } from "react";
import { profileKind } from "../constance";
import { useTranslation } from "react-i18next";
import { getProfile } from "../components/profileInstrument/api";

export default function useCasingList(boreholeID) {
  const { t } = useTranslation();

  const [casing, setCasing] = useState([]);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    getProfile(boreholeID, profileKind.CASING).then(response => {
      const temp = [
        {
          key: 0,
          value: null,
          text: (
            <span
              style={{
                color: "red",
              }}>
              {t("common:reset")}
            </span>
          ),
        },
        { key: 1, value: 0, text: t("common:no_casing") },
      ];
      if (response.length > 0) {
        response.forEach(e => {
          temp.push({
            key: e.id,
            value: e.id,
            text: e.name === null || e.name === "" ? t("common:np") : e.name,
          });
        });
      }
      if (mounted.current) {
        setCasing(temp);
      }
    });

    return () => {
      mounted.current = false;
    };
  }, [boreholeID, t]);

  return { casing };
}
