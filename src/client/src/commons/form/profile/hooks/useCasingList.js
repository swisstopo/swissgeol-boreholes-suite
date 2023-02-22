import { useState, useEffect, useRef } from "react";
import { profileKind } from "../constance";
import { useTranslation } from "react-i18next";
import { getProfile } from "../components/profileInstrument/api";
import { useQuery } from "react-query";

export default function useCasingList(boreholeID) {
  const { t } = useTranslation();

  const [casing, setCasing] = useState([]);
  const mounted = useRef(false);
  const { data: profiles } = useQuery(
    ["profile", boreholeID, profileKind.CASING],
    () => getProfile(boreholeID, profileKind.CASING),
    { staleTime: 5000 },
  );

  useEffect(() => {
    mounted.current = true;

    if (profiles) {
      const temp = [{ key: 1, value: 0, text: t("common:no_casing") }];
      if (profiles.length > 0) {
        profiles.forEach(e => {
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
    }

    return () => {
      mounted.current = false;
    };
  }, [t, profiles]);

  return { casing };
}
