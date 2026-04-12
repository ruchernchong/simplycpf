"use client";

import { useAtom } from "jotai";
import { useQueryState } from "nuqs";
import { useCallback, useEffect, useRef } from "react";
import { latestIncomeCeilingDateAtom } from "@/atoms/income-ceiling-atom";
import { settingsAtom } from "@/atoms/setting-atom";
import { CPF_INCOME_CEILING } from "@/constants";

const VALID_CEILING_DATES = Object.keys(CPF_INCOME_CEILING);

export function UrlParamsSync() {
  const [incomeParam, setIncomeParam] = useQueryState("income");
  const [dobParam, setDobParam] = useQueryState("dob");
  const [ceilingParam, setCeilingParam] = useQueryState("ceiling");

  const [settings, setSettings] = useAtom(settingsAtom);
  const [ceilingDate, setCeilingDate] = useAtom(latestIncomeCeilingDateAtom);

  const initialLoadDone = useRef(false);

  const loadFromUrl = useCallback(() => {
    if (initialLoadDone.current) return;
    if (!incomeParam && !dobParam && !ceilingParam) return;

    initialLoadDone.current = true;

    setSettings((prev) => {
      const updated = { ...prev };
      if (
        incomeParam &&
        Number(incomeParam) > 0 &&
        prev.monthlyGrossIncome === 0
      ) {
        updated.monthlyGrossIncome = Number(incomeParam);
      }
      if (dobParam && !prev.birthDate) {
        updated.birthDate = dobParam;
      }
      return updated;
    });

    if (ceilingParam && VALID_CEILING_DATES.includes(ceilingParam)) {
      setCeilingDate(ceilingParam);
    }
  }, [incomeParam, dobParam, ceilingParam, setSettings, setCeilingDate]);

  useEffect(() => {
    loadFromUrl();
  }, [loadFromUrl]);

  useEffect(() => {
    if (settings.monthlyGrossIncome > 0) {
      setIncomeParam(String(settings.monthlyGrossIncome));
    }
  }, [settings.monthlyGrossIncome, setIncomeParam]);

  useEffect(() => {
    if (settings.birthDate) {
      setDobParam(settings.birthDate);
    }
  }, [settings.birthDate, setDobParam]);

  useEffect(() => {
    if (ceilingDate) {
      setCeilingParam(ceilingDate);
    }
  }, [ceilingDate, setCeilingParam]);

  return null;
}
